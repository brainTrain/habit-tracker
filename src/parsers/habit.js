export function flattenHabitItems(groupedData) {
  const flatHabitItems = Object.keys(groupedData).reduce((prev, habitDate) => {
    const habitItems = groupedData[habitDate]?.tableList || [];
    return [...prev, ...habitItems];
  }, []);

  return flatHabitItems;
}
