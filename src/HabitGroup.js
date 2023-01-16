function HabitGroup({ habitLabel, habitsList }) {
  return (
    <section>
      <h3>{habitLabel}</h3>
      <section>
        {habitsList.map((habit) => {
          const { id, count, datetime, habitLabel } = habit;
          return (
            <div key={id}>
              <p>{count}</p>
              <p>
                {datetime.toLocaleTimeString()} {datetime.toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </section>
    </section>
  );
}

export default HabitGroup;
