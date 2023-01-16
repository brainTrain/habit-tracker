// libraries
import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

function HabitGroup({ habitLabel, habitsList, totalCount }) {
  const [areDetailsShown, setAreDetailsShown] = useState(false);
  console.log(`areDetailsShown:${habitLabel}`, areDetailsShown);
  // TODO: this only toggles once then it never re-renders again for some reason
  const handleToggleDetails = useCallback(() => {
    console.log('toggle click');
    setAreDetailsShown((prev) => {
      console.log('calling?');
      return !prev;
    });
  }, [areDetailsShown]);

  const toggleDetailsText = areDetailsShown ? 'hide details' : 'show details';

  return (
    <section>
      <h3>{habitLabel}</h3>
      <p>total: {totalCount}</p>
      <button onClick={handleToggleDetails}>{toggleDetailsText}</button>
      {areDetailsShown ? (
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
      ) : null}
    </section>
  );
}

HabitGroup.propTypes = {
  habitLabel: PropTypes.string,
  habitsList: PropTypes.array,
  totalCount: PropTypes.number,
};

HabitGroup.defaultProps = {
  habitLabel: '',
  habitsList: [],
  totalCount: 0,
};

export default HabitGroup;
