const PERIODS_PER_YEAR = {
  Monthly: 12,
  Quarterly: 4,
  semiAnnually: 2,
  Yearly: 1,
};

function calculateAmortization({ principal, annualInterestRate, termMonths, frequency }) {
  const periodsPerYear = PERIODS_PER_YEAR[frequency];
  if (!periodsPerYear) {
    throw new Error(`Unknown frequency: ${frequency}`);
  }

  const monthsPerPeriod = 12 / periodsPerYear;
  if (termMonths % monthsPerPeriod !== 0) {
    throw new Error(
      `termMonths (${termMonths}) must be divisible by ${monthsPerPeriod} for ${frequency} frequency`
    );
  }

  const numberOfInstallments = termMonths / monthsPerPeriod;
  const periodicRate = annualInterestRate / 100 / periodsPerYear;

  const rawInstallment =
    periodicRate === 0
      ? principal / numberOfInstallments
      : (principal * periodicRate * Math.pow(1 + periodicRate, numberOfInstallments)) /
        (Math.pow(1 + periodicRate, numberOfInstallments) - 1);
  const installmentAmount = Math.round(rawInstallment * 100) / 100;

  let remainingBalance = principal;
  let totalInterest = 0;
  const schedule = [];

  for (let period = 1; period <= numberOfInstallments; period++) {
    const interestComponent = Math.round(remainingBalance * periodicRate * 100) / 100;
    // Last installment absorbs any rounding drift so the balance lands exactly on 0.
    const principalComponent =
      period === numberOfInstallments
        ? remainingBalance
        : Math.round((installmentAmount - interestComponent) * 100) / 100;

    remainingBalance = Math.round((remainingBalance - principalComponent) * 100) / 100;
    totalInterest = Math.round((totalInterest + interestComponent) * 100) / 100;

    schedule.push({
      installmentNumber: period,
      payment: Math.round((interestComponent + principalComponent) * 100) / 100,
      interestComponent,
      principalComponent,
      remainingBalance,
    });
  }

  return {
    installmentAmount,
    totalInterest,
    totalRepayment: Math.round((principal + totalInterest) * 100) / 100,
    schedule,
  };
}

module.exports = { calculateAmortization, PERIODS_PER_YEAR };
