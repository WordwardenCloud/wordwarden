import React, { useState } from "react";
import styles from '../../styles/Tooltip.module.css';

export const Tooltip = ({ children, content, direction, delay = 400 }) => {
  let timeout;
  const [active, setActive] = useState(false);

  const showTip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTip = () => {
    clearTimeout(timeout);
    setActive(false);
  };

  return (
    <div
      className={styles.TooltipWrapper}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      {active && (
        <div className={`${styles.TooltipTip} ${styles[direction]}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
