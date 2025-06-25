export const isUserAvailableForDonation = (dob, lastDonation) => {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  let is18Plus = true;
  let donated3MonthsAgo = true;

  // If dob exists, calculate actual age
  if (dob) {
    const dobDate = new Date(dob);
    if (!isNaN(dobDate.getTime())) {
      const ageDiff = today.getFullYear() - dobDate.getFullYear();
      is18Plus =
        ageDiff > 18 ||
        (ageDiff === 18 &&
          (today.getMonth() > dobDate.getMonth() ||
            (today.getMonth() === dobDate.getMonth() &&
              today.getDate() >= dobDate.getDate())));
    }
  }

  // If lastDonation exists, check if it's more than 3 months ago
  if (lastDonation) {
    const lastDate = new Date(lastDonation);
    if (!isNaN(lastDate.getTime())) {
      donated3MonthsAgo = lastDate <= threeMonthsAgo;
    }
  }

  return is18Plus && donated3MonthsAgo;
};
