// libraries
import { useCallback, useState } from 'react';

function HabitGroup({ habitLabel, habitsList = [], totalCount = 0 }) {
  const [shouldShowDetails, setShouldShowDetails] = useState(false);

  const handleShowDetails = useCallback(() => {
    setShouldShowDetails(true);
  }, []);

  const handleHideDetails = useCallback(() => {
    setShouldShowDetails(false);
  }, []);

  return (
    <section>
      <h3>{habitLabel}</h3>
      <p>total: {totalCount}</p>
      {shouldShowDetails ? (
        <button onClick={handleHideDetails}>hide details</button>
      ) : (
        <button onClick={handleShowDetails}>show details</button>
      )}
      {shouldShowDetails ? (
        <>
          <section>
            {habitsList
              .sort((a, b) => {
                // TODO: sort in render? luuul #webscale
                return b?.datetime?.getTime() - a?.datetime?.getTime();
              })
              .map((habit) => {
                const { id, count, datetime } = habit;
                return (
                  <div key={id}>
                    <p>{count}</p>
                    <p>
                      {datetime.toLocaleTimeString()}{' '}
                      {datetime.toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
          </section>
        </>
      ) : null}
    </section>
  );
}

export default HabitGroup;
