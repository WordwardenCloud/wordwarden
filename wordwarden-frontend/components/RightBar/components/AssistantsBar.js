import { useState } from 'react';
import styles from '../../../styles/AssistantsBar.module.css';
import { assistantsList } from '../../Editor/modules/assistantsList';

export const AssistantsBar = ({ assistants, setAssistantsFromBar, isloading }) => {
  const [isAssistantsBarShown, setIsAssistantsBarShown] = useState(false);
  const [hoveredAssistant, setHoveredAssistant] = useState('');

  return (<div className={styles.assistantsContainer}>
      {isAssistantsBarShown && 
        <div className={styles.assistantsBar}>
          {assistantsList.map(({ id, name }) => {
            return (<div key={id} className={styles.assistantContainer} onMouseOver={() => setHoveredAssistant(id)} onMouseLeave={() => setHoveredAssistant('')}>
              {hoveredAssistant === id && <h6 className={styles.assistantName}>{name}</h6>}
              <img
                src={assistants.includes(id) ? `/assistants_icons/${id}.png` : `/assistants_icons/${id}_inactive.png`}
                onClick={() => setAssistantsFromBar(id)} 
                className={styles.assistantButton}
              />
            </div>)
          })}
        </div>
      }

      {/* {isloading &&
      <div className={styles.loaderContainer}>
        <span className={styles.loader}></span>
      </div>
      } */}

      <div className={styles.aiButtonContainer}>
        <button className={styles.aiIcon} onClick={() => setIsAssistantsBarShown(!isAssistantsBarShown) }>
          <img src='/app_icons/aiIcon.png' className={styles.aiImage} />
        </button>
      </div>
    </div>
  )
}