import styles from '../../styles/Notes.module.css';
import { UserAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { load } from '../../reducers/notes';
import { v4 as uuidv4 } from 'uuid';

const firestoreTimestampToDate = (timestamp) => {
  return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
}

const classifyNotes = (notes) => {

  const classified = {
    today: [], yesterday: [], thisWeek: [], thisMonth: [], thisYear: []
  };

  notes.forEach(note => {
    
    const date = firestoreTimestampToDate(note.lastModified);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1);      
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    if (date >= new Date(today.setHours(0,0,0,0))) {
        classified.today.push(note);
    } else if (date >= new Date(yesterday.setHours(0,0,0,0)) && date < new Date(today.setHours(0,0,0,0))) {
        classified.yesterday.push(note);
    } else if (date >= startOfWeek && date < startOfMonth) {
        classified.thisWeek.push(note);
    } else if (date >= startOfMonth && date < startOfNextMonth) {
        classified.thisMonth.push(note);
    } else if (date >= startOfYear) {
        classified.thisYear.push(note);
    }

  });

  Object.keys(classified).forEach(key => {

    classified[key].sort((a, b) => {
      const dateA = firestoreTimestampToDate(a.lastModified);
      const dateB = firestoreTimestampToDate(b.lastModified);
      return dateB - dateA;  
    });

    if (classified[key].length === 0) {
      delete classified[key];
    }

});

  return classified;

}

export const Notes = ({ newNote, setLocalId }) => {

  const queryClient = useQueryClient();

  const dispatch = useDispatch()

  const loadNote = (id, content, model, date) => {
    console.log('loading file ⌛️')
    setLocalId(uuidv4())
    dispatch(load({id, content, model, lastModified: firestoreTimestampToDate(date)}))
  } 

  const { user, logOut } = UserAuth();

  const [isNotesModalShown, setIsNotesModalShown] = useState(false);
  const [isModalShown, setIsModalShown] = useState(false);
  const [hoveredNote, setHoveredNote] = useState('');

  
  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (e) {
      console.log(e);
    }
  };

  // fetching notes
  const getNotes = async ({ signal }) => {

    const { data } = await axios.get(`http://localhost:3000/notes/byuser/${user?.uid}`, { signal })

    return data
  }

  // declaring query for model
  const { data: classifiedNotes, error, isLoading } = useQuery({ 
    queryKey: ['notes'], 
    queryFn: ({ signal }) => getNotes({ signal }),
    select: (data) => classifyNotes(data),
  });

  const deleteNote = async (id) => {

    await axios.delete(`http://localhost:3000/notes/delete/${user?.uid}/${id}`)

    queryClient.invalidateQueries({ queryKey: ['notes'] });

  }
  
  if (!user) {
    return;
  }

  return (
    <div className={`${styles.notesModal} ${!isNotesModalShown && styles.notesModalHidden}`} onMouseLeave={() => setIsNotesModalShown(false)}>
      <div className={styles.container}>

        <button className={styles.newNoteButtonBlack} onClick={() => newNote()}>
          <img src="/app_icons/newNoteWhite.png" className={styles.buttonImage}/>
          <p className={styles.newNoteText}>New note</p>
        </button>

        <div className={styles.notesContainer}>
          {classifiedNotes &&
          Object.keys(classifiedNotes).map((category) => (
            <div className={styles.notes} key={category}>
              <h6 className={styles.dateCategory}>{category.charAt(0).toUpperCase() + category.slice(1)}</h6>
              {classifiedNotes[category].map(note => (
                <div className={styles.noteContainer} key={note.id} onMouseOver={() => setHoveredNote(note.id)} onMouseLeave={() => setHoveredNote('')}>
                  <p key={note.id} className={styles.note} onClick={() => loadNote(note.id, note.content, note.localModel, note.lastModified)}>
                    {note.title}
                  </p>
                  <button className={styles.noteOptionsButton} onClick={() => deleteNote(note.id)}>
                    {hoveredNote === note.id && <img src='/app_icons/delete.png' className={styles.moreImage}></img>}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={`${!isModalShown && styles.hidden} ${styles.modal}`} onMouseLeave={() => setIsModalShown(false)}>
          <div>
            <button className={styles.modalButton} onClick={handleSignOut}>Log-Out</button>
          </div>
        </div>
        
        <div className={styles.profile} onMouseEnter={() => setIsModalShown(true)}>
          <div className={styles.initial}>
            {user.displayName[0].toUpperCase()}
          </div>
          <div className={styles.name}>
              {user.displayName.split(' ')[0]}
          </div>
        </div>
      </div>


      <div className={styles.opener} onMouseEnter={() => setIsNotesModalShown(true)}>
        {!isNotesModalShown ? 
          <img src='/app_icons/notesClosed.png' className={styles.notesClosedIcon} /> 
        : 
          <img src='/app_icons/notesOpened.png' className={styles.notesOpenedIcon} />
        }
      </div>
      
    </div>
  ) 
}