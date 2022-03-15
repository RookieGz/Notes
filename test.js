function getMonth(start, end) {
  const [startYear, startMonth] = start.split("-").map((item) => Number(item));
  const [endYear, endMonth] = end.split("-").map((item) => Number(item));

  const yearDiff = endYear - startYear;

  return Array.from({ length: endMonth - startMonth + 12 * yearDiff - 1 }).map(
    (_, index) =>
      [
        startYear + Math.floor((index + startMonth) / 12),
        (startMonth + index) % 12 + 1,
      ].join("-")
  );
}

console.log(getMonth('2018-2', '2018-12'))