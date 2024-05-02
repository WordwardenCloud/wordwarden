import React, { useState } from 'react';
import styles from '../../styles/Navbar.module.css';
import { Tooltip } from '../Ui_components';

import { UserAuth } from '../../context/AuthContext'
import { formatDistanceToNow, parseISO } from 'date-fns';


import { useQueryClient } from '@tanstack/react-query';


export const Navbar = ({ newNote, lastModified, setAssistants, assistants, setThreadDiv }) => {

  const { user, signIn, logOut } = UserAuth();
  const [tmpThreadDiv, setTmpThreadDiv] = useState([])

  const [isModalShown, setIsModalShown] = useState(false);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (e) {
      console.log(e);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (e) {
      console.log(e);
    }
  };

  const handleHideClick = () => {
    setAssistants([]);
    setThreadDiv([]);
  }
  
  return (
    <div className={styles.navbar} onMouseLeave={() => setIsModalShown(false)}>

      {user ?
        <button className={styles.newNoteButton} onClick={() => newNote()}>
          <img src="/app_icons/newNote.png" className={styles.buttonImg} />
        </button>
      :
        <button className={styles.googleSignin} onClick={() => handleSignIn()}>
          <img src='/googleLogo.png' className={styles.googleLogo}></img>
          <p className={styles.signinText}>Sign in with Google</p>
        </button>
      }

      <div className={styles.rightContainer}>

        {lastModified && <>
          <p className={styles.lastUpdated}>Last updated {formatDistanceToNow(lastModified, { addSuffix: true })}</p>
          <img src='/app_icons/divider.png' className={styles.divider} />
        </>}

        {assistants.length > 0 ?
          <Tooltip content='Hide all assistants' direction='left'>
            <button className={styles.settingsButton} onClick={handleHideClick} >
              <img src="/app_icons/view.png" className={styles.buttonImg} />
            </button>
          </Tooltip>
        :
          <Tooltip content='Show all assistants' direction='left'>
            <button className={styles.settingsButton} onClick={() => setAssistants(['dev', 'sum', 'ela', 'chi', 'sen'])} >
              <img src="/app_icons/hide.png" className={styles.buttonImg} />
            </button>
          </Tooltip>
        }
      </div>
        
    </div>
  )
}