export function displayNum(value: number) {
  if (value >= 1000) return (value / 1000).toFixed(1) + "K";
  if (value >= 1000000) return (value / 1000000).toFixed(3) + "M";
  if (value >= 1000000000) return (value / 1000000).toFixed(3) + "B";
  else return value.toString();
}
