import Student from '../models/Student.model.js'
import FeePayment from '../models/Fee.model.js'
async function recalculateFeeStatus(studentId) {
    const student = await Student.findById(studentId);
    if (!student) return;

    const monthlyFee = Number(student.fees || 0);
    if (monthlyFee === 0) {
        student.feeStatus = { status: 'new', monthlyFee: 0, lastUpdated: new Date() };
        await student.save();
        return;
    }

    const admissionDate = student.admissionDate || student.createdAt || new Date();
    const joinDay = new Date(admissionDate).getDate();
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
    const admDate = new Date(admissionDate);
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
    if (balance < 0) { status = overdueMonths >= 1 ? 'Overdue' : 'Pending'; pendingAmount = Math.abs(balance); }
    else if (balance > 0) { status = 'Extra'; }


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

    // Save
    student.feeStatus = {
        status,
        monthlyFee,
        nextDueDate,
        currentCycleStart: cycleStart,
        currentCycleEnd: cycleEnd,
        totalPaid,
        totalExpected,
        balance,
        pendingAmount: Math.abs(Math.min(0, balance)),
        paidCycles,
        overdueMonths,
        lastPaidDate: lastPayment?.createdAt || null,
        lastUpdated: new Date()
    }

    await student.save();
    return student.feeStatus;
}

export default recalculateFeeStatus