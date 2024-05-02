import styles from '../../styles/RightBar.module.css';
import { AssistantsBar } from './components/AssistantsBar';
import { ThreadCard } from './components/ThreadCard';

export const RightBar = ({ assistants, activeAssistants, setAssistantsFromBar, isLoading, threadDiv, setThreadDiv, closeThread, replaceThread, editor, localModel, setIsRightBarOpened, isRightBarOpened }) => {

  const handleCloseClick = () => {
    setIsRightBarOpened(false);
    setThreadDiv([]);
  }
  return (<>

    {isRightBarOpened && <button className={styles.opener} onClick={handleCloseClick}>
      <p className={styles.openerText}>Close</p>
      <img src='/app_icons/rightBarOpened.png' className={styles.openerImage} />
    </button>
    }

    <div className={`${styles.rightBar} ${!isRightBarOpened && styles.rightModalHidden}`}>

      <AssistantsBar 
        assistants={assistants} 
        activeAssistants={activeAssistants} 
        setAssistantsFromBar={setAssistantsFromBar}
        className={styles.assistantsBar}
        isloading={isLoading}
      />

      <div className={styles.threadDivContainer}>
        <div className={styles.threadDiv}>
          {threadDiv && threadDiv.map(thread => {return (
            (thread.clicked) && <ThreadCard 
            key={thread.proposition}
            assistant={thread.assistant}
            excerpt={thread.excerpt}
            proposition={thread.proposition}
            hover={thread.hover}
            clicked={thread.clicked}
            replaceThread={replaceThread}
            closeThread={closeThread}
            editor={editor}
            localModel={localModel}
            assistants={assistants}
            />
          )})}
        </div>
      </div>
    </div>
    </>
  )
}
