import Student from '../models/Student.model.js';
import FeePayment from '../models/Fee.model.js';

async function recalculateFeeStatus(studentId) {
  try {
    const student = await Student.findById(studentId);
    if (!student) return null;

    // Reset feeStatus if it was previously saved as a primitive string
    if (typeof student.feeStatus !== 'object' || student.feeStatus === null) {
      student.feeStatus = {};
    }

    const monthlyFee = Number(student.fees || 0);
    if (monthlyFee === 0) {
      student.set('feeStatus', {
        status: 'new',
        monthlyFee: 0,
        overdueMonths: 0,
        lastUpdated: new Date()
      });
      await student.save();
      return student.feeStatus;
    }

    const rawDate = student.admissionDate || student.createdAt;
    const admDate = (rawDate && !isNaN(new Date(rawDate).getTime())) ? new Date(rawDate) : new Date();
    const joinDay = admDate.getDate() || 1;
    const now = new Date();

    // Current cycle
    let cycleStart, cycleEnd;
    if (now.getDate() >= joinDay) {
      cycleStart = new Date(now.getFullYear(), now.getMonth(), joinDay);
      cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, joinDay - 1);
    } else {
      cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, joinDay);
      cycleEnd = new Date(now.getFullYear(), now.getMonth(), joinDay - 1);
    }

    // Total cycles from admission
    const diffMonths = (cycleStart.getFullYear() - admDate.getFullYear()) * 12
      + (cycleStart.getMonth() - admDate.getMonth());
    const totalCycles = Math.max(1, diffMonths + 1);
    const totalExpected = totalCycles * monthlyFee;

    // Sum all payments
    const payments = await FeePayment.find({ studentId: student._id });
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const balance = totalPaid - totalExpected;
    const paidCycles = Math.floor(totalPaid / monthlyFee);

    const overdueMonths = balance < 0 ? Math.ceil(Math.abs(balance) / monthlyFee) : 0;
    // Status
    let status = 'Paid', pendingAmount = 0;
    if (balance < 0) {
      status = overdueMonths >= 1 ? 'Overdue' : 'Pending';
      pendingAmount = Math.abs(balance);
    } else if (balance > 0) {
      status = 'Extra';
    }

    // Next due date
    let nextDueDate;
    if (balance >= 0 && totalPaid > 0) {
      const nextOffset = Math.max(totalCycles + 1, paidCycles + 1);
      nextDueDate = new Date(admDate.getFullYear(), admDate.getMonth() + nextOffset, joinDay);
    } else {
      nextDueDate = cycleEnd;
    }

    const lastPayment = payments.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    // Use student.set to cleanly replace object structure safely
    student.set('feeStatus', {
      status,
      monthlyFee,
      nextDueDate: !isNaN(new Date(nextDueDate).getTime()) ? new Date(nextDueDate) : new Date(),
      currentCycleStart: !isNaN(new Date(cycleStart).getTime()) ? new Date(cycleStart) : new Date(),
      currentCycleEnd: !isNaN(new Date(cycleEnd).getTime()) ? new Date(cycleEnd) : new Date(),
      totalPaid,
      totalExpected,
      balance,
      pendingAmount: Math.abs(Math.min(0, balance)),
      paidCycles,
      overdueMonths,
      lastPaidDate: lastPayment?.createdAt || null,
      lastUpdated: new Date()
    });

    await student.save();
    return student.feeStatus;
  } catch (err) {
    console.error(`Error recalculating fee status for student ${studentId}:`, err);
    return null;
  }
}

export default recalculateFeeStatus;