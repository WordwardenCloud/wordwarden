import React, { useState } from 'react';
import styles from '../../../styles/ThreadCard.module.css';
import { assistantsList } from '../../Editor/modules/assistantsList';
import { sortByExcerpt, setHighlightTextByExcerpt, unsetAllHighlights, setAllHighlights } from '../../Editor/modules/tiptap';

export function ThreadCard({ assistant, excerpt, proposition, clicked, threadDiv, replaceThread, closeThread, editor, localModel, assistants }) {
  const [isHovered, setIsHovered] = useState(false)

  const setThreadHighlight = () => {

    unsetAllHighlights(editor)

    if (!isHovered) {
      console.log('in setThreadHighlight' + JSON.stringify(localModel)?.slice(0, 250))
      const content = sortByExcerpt(localModel, [assistant])[excerpt]
      setHighlightTextByExcerpt(editor, excerpt, content, "focus");
      setIsHovered(true);
    } else {
      setAllHighlights(editor, assistants, localModel, threadDiv);
      setIsHovered(false);
    }
  }

  const noReplaceAssistants = ['dev', 'sen']
  
  return (
    <div className={styles.threadCardContainer} onMouseEnter={setThreadHighlight} onMouseLeave={setThreadHighlight}>
      <div className={styles.threadCard}>
        <div className={styles.header}>
          <div className={styles.profile}>
            <img src={`assistants_icons/${assistant}.png`} alt='assistant icon' className={styles.assistantIcon} />
            <h6 className={styles.assistant}>{assistantsList.find((item) => item.id === assistant).name}</h6>
          </div>
          {clicked && <button className={styles.close} onClick={() => closeThread(assistant, excerpt, proposition)}>
            <img src='/app_icons/delete.png' alt='delete icon' className={styles.closeIcon} />
          </button>}
        </div>
        <p className={styles.proposition}>{proposition}</p>
        <div className={styles.replaceDiv}>
          {!noReplaceAssistants.includes(assistant) && clicked && <button className={styles.replace} onClick={() => replaceThread(assistant, excerpt, proposition)}>Replace</button>}
        </div>
      </div>
    </div>
  )
}