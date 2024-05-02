import { useEditor, EditorContent } from '@tiptap/react';
import { EditingMenu } from './components/EditingMenu';
import Placeholder from '@tiptap/extension-placeholder'
import Document from '@tiptap/extension-document';
import { useState, useRef, useEffect, useCallback } from 'react';
import { RightBar } from '../RightBar';
import StarterKit from '@tiptap/starter-kit';
import styles from '../../styles/Editor.module.css';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import { AssistantMark } from './extensions/AssistantMark';
import { ColorCircleDecorator } from './extensions/ColorCircleDecorator';
import CharacterCount from '@tiptap/extension-character-count';
import { HoverExtension } from './extensions/AddHoverEvent';
import { getAllAttributes, setAllHighlights, unsetAllHighlights, replaceText } from './modules/tiptap';
import { Navbar } from '../Navbar';
import { UserAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Notes } from '../Notes';
import { useSelector, useDispatch } from 'react-redux';
import { setModel, setId, load } from '../../reducers/notes';
import { debounce } from 'lodash';
import nlp from 'compromise';

const CustomDocument = Document.extend({
  content: 'heading block*',
})

export const Editor = () => {

  const queryClient = useQueryClient();
  const dispatch = useDispatch()

  const { user } = UserAuth();

  const isUpdateAllowed = useRef(true);

  const [isRightBarOpened, setIsRightBarOpened] = useState(false)
  const note = useSelector(state => state.notes.value)
  const localModel = useSelector(state => state.notes.value.localModel)
  const noteId = useSelector(state => state.notes.value.id)

  const setLocalModel = (lm) => dispatch(setModel(lm))
  const setNoteId = (id) => dispatch(setId(id))
  
  const [localId, setLocalId] = useState(null)
  const [lastModified, setLastModified] = useState(undefined)

  const [assistants, setAssistants] = useState(['dev', 'sum', 'ela', 'chi', 'sen']);
  const [activeAssistants, setActiveAssistants] = useState([]);

  const [isLocalModelChanging, setIsLocalModelChanging] = useState(true)
  const [threadDiv, setThreadDiv] = useState([]);

  // const previousWordCountRef = useRef(null);
  const previousSentencesCount = useRef(0);

  // loading note
  useEffect (() => {

    if (noteId && noteId !== localId && note.content) {

      isUpdateAllowed.current = false;

      queryClient.cancelQueries({ queryKey: ['model'] });
      setLocalId(null);
      editor?.commands.setContent(note.content);
      setLastModified(note.lastModified)
      
      const currentContent = editor.getText();
      const doc = nlp(currentContent);
      const sentences = doc.sentences().out('array');
      const validSentences = sentences.filter(sentence => sentence.split(' ').length >= 4);
      previousSentencesCount.current = validSentences.length;
      
      isUpdateAllowed.current = true;
    }

    window.addEventListener('keydown', handleLetterKeyPress);
    return () => {
      window.removeEventListener('keydown', handleLetterKeyPress);
    };

  }, [noteId])

  // Set noteId when user is writing text (happens when file loads)
  const handleLetterKeyPress = (event) => {
    if (event.key.match(/^[a-zA-Z]$/) && noteId) {
      console.log('setting localId')
      setLocalId(noteId)
      window.removeEventListener('keydown', handleLetterKeyPress);
    }
  };

  // Create new note
  const newNote = () => {
    console.log('newNote')
    setThreadDiv([]);
    const newId = uuidv4();
    dispatch(load({ id: newId, content: undefined, model: {} }));
    editor.commands.clearContent();
  };

  // debounce
  const saveNote = useCallback(async () => {

    console.log('Trying to save ❓');
    if (noteId !== localId) {
      return
    }
    
    const content = editor?.getJSON();
    const title = editor && content.content && content.content[0] && content.content[0].content && content.content[0].content[0] && content.content[0].content[0].text ? content.content[0].content[0].text : 'undefined';
    const uid = user?.uid;

    console.log('saving ✅\n' + title + '\n' + localId);

    try {
        await axios.post(`http://localhost:3000/notes/save/${uid}/${localId}`, {
            title,
            content,
            localModel
        });  

        setLastModified(Date())

        queryClient.invalidateQueries({ queryKey: ['notes'] });
        
    } catch (error) {
        throw new Error(error);
    }
  }, [user, noteId, localId, localModel]); 

  // Debounce the saveNote function
  const debouncedSaveNote = useCallback(debounce(() => {

      saveNote();

  }, 500), [saveNote, user, noteId, localId, localModel]);


  // fetching model
  const getModel = async ({ signal }) => {

    const updatedModel = JSON.parse(JSON.stringify(localModel));

    const input = editor?.getText();

    const { data } = await axios.post(`http://localhost:3000/models/gemini/`, {
        assistants,
        input
      }, { signal })

    Object.keys(data).forEach(category => {

        if (!updatedModel[category]) {
            updatedModel[category] = [];
        }

        data[category].forEach(newItem => {
            if (!updatedModel[category].some(existingItem => existingItem.excerpt === newItem.excerpt)) {
                updatedModel[category].push(newItem);
            }
        });
    });

    return updatedModel
  }

  // declaring query for model
  const { data: fetchedModel, error, isLoading, refetch } = useQuery({ queryKey: ['model'], queryFn: ({ signal }) => getModel({ signal }), enabled: false, refetchOnMount: false});


  // updating localModel
  useEffect(() => {

    if (fetchedModel) {
      !error && setLocalModel(fetchedModel)
      setIsLocalModelChanging(!isLocalModelChanging)
    }
    
  }, [fetchedModel])

  // Set highlights
  useEffect(() => {
    if (localModel && editor) {
      // Set active assistants (intervening on text)
      isUpdateAllowed.current = false
      Object.entries(localModel).forEach(([assistant, content]) => {
        setActiveAssistants(currentActiveAssistants => {
          if (!currentActiveAssistants.includes(assistant) && content.length > 0 && assistants.includes(assistant)) {
            return [...currentActiveAssistants, assistant];
          } else {
            return [...currentActiveAssistants];
          }
        });
      });
      
      unsetAllHighlights(editor);
      setAllHighlights(editor, assistants, localModel, threadDiv);

      threadDiv.length === 0 && setIsRightBarOpened(false);
      debouncedSaveNote()
      isUpdateAllowed.current = true;
    }
  }, [localModel, assistants, isLocalModelChanging, threadDiv]);

  // Thread button Close
  const closeThread = (assistant, excerpt, proposition) => {
    const newLocalModel = {
      ...localModel,
      [assistant]: localModel[assistant].filter(item => item.excerpt !== excerpt)
    };
    setLocalModel(newLocalModel);
  
    setThreadDiv(prevThreadDiv => prevThreadDiv.filter(thread => thread.proposition !== proposition));
    setIsLocalModelChanging(prev => !prev);
  };

  // Thread button Replace
  const replaceThread = (assistant, excerpt, proposition) => {
    const newLocalModel = {
        ...localModel,
        [assistant]: localModel[assistant].filter(item => item.excerpt !== excerpt)
    };
    setLocalModel(newLocalModel);

    replaceText(editor, excerpt, proposition);

    setThreadDiv(prevThreadDiv => prevThreadDiv.filter(thread => !thread.excerpt.includes(excerpt)));
    setIsLocalModelChanging(prev => !prev);
  };

  // Handle assistants activation/deactivation from bar
  const setAssistantsFromBar = (assistantId) => {
    // Activate / deactivate
    setAssistants(currentAssistants => {
      if (currentAssistants.includes(assistantId)) {
        const newAssistants = currentAssistants.filter((assistant) => assistant != assistantId)
        return newAssistants
      } else {
        return [...currentAssistants, assistantId]
      } 
    })
  };

  // Editor with events
  const editor = useEditor({ onCreate({ editor }) {

    if (!localId && !noteId) {
      const newNoteId = uuidv4();
      console.log('ON CREATE, newNoteId: ' + newNoteId)
      setNoteId(newNoteId);
    }

    if (localModel) {

      // Set active assistants (intervening on text)
      Object.entries(localModel).forEach(([assistant, content]) => setActiveAssistants(currentActiveAssistants => {
        if (!currentActiveAssistants.includes(assistant) && content.length > 0 && assistants.includes(assistant)) {
          return [...currentActiveAssistants, assistant]
        } else {
          return [...currentActiveAssistants]
        }
      }))
  
      setAllHighlights(editor, assistants, localModel, threadDiv);
    }
  },
    onUpdate({ editor }) {

    if (!isUpdateAllowed.current) {
      return; 
    }

    const wordCount = editor.storage.characterCount.words();

    const currentContent = editor.getText();
    const doc = nlp(currentContent);
    const sentences = doc.sentences().out('array');

    function isComplex(sentence) {

    const doc = nlp(sentence);
    // Consider a sentence complex if it's long and uses conjunctions or compound structures
    const longSentence = sentence.split(' ').length > 15; // Adjust length as needed
    const hasConjunctions = doc.has('(and|but|or|although|because)');

    return longSentence || hasConjunctions;
  }

    const filteredSentences = sentences.filter(sentence => {
        return nlp(sentence).match('(must|should|could|clearly|undeniably)').found || isComplex(sentence);
    });


    // const validSentences = sentences.filter(sentence => sentence.split(' ').length >= 4);

    if (filteredSentences.length > previousSentencesCount.current) {
      queryClient.cancelQueries({ queryKey: ['model'] })
      refetch()
      previousSentencesCount.current = filteredSentences.length; 
    };

    if (wordCount === 0) {
      queryClient.cancelQueries({ queryKey: ['model'] })
      previousSentencesCount.current = 0;
      setLocalModel({})
      setThreadDiv([])
      setActiveAssistants([])
    }

    if (user) {
      setLocalId(id => {
        id && debouncedSaveNote()
        return id
      })
    }

    },
    extensions: [
    CustomDocument,
    StarterKit.configure({
      document: false,
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return 'What’s the title?'
        }
        return 'Can you add some further context?'
      },
    }),
      Underline,
      BulletList,
      AssistantMark,
      CharacterCount,
      ColorCircleDecorator,
      // event handle extension
      HoverExtension.configure({

        onMouseOver: (view, event) => {

          if (!localModel) {
            return
          }

          const attributes = getAllAttributes(event.target, assistants);
          const excerpt = attributes.excerpt;
        
          Object.entries(attributes).forEach(([assistant, proposition]) => {
            if (assistants.includes(assistant)) {
              setThreadDiv(prevThreadDiv => {
                const index = prevThreadDiv.findIndex(thread => thread.assistant === assistant && thread.proposition === proposition);
          
                if (index !== -1) {
                  return prevThreadDiv;
                } else {
                  return [ { assistant, proposition, excerpt, hover: true, clicked: false }, ...prevThreadDiv];
                }
              });
            }
          });
        },

        onMouseOut: (view, event) => {

          if (!localModel) {
            return
          }

          const attributes = getAllAttributes(event.target, assistants);

          Object.entries(attributes).forEach(([assistant, proposition]) => {
            if (assistants.includes(assistant)) {
              setThreadDiv(currentThreads =>
                currentThreads.filter(thread => thread.clicked)
              );
            }
          });
        },

        onClick: (view, event) => {
          
          // setLocalId(noteId);

          if (!localModel) {
            return
          }

          const attributes = getAllAttributes(event.target, assistants);
          const excerpt = attributes.excerpt;
          const newThreadDiv = []

          Object.entries(attributes).forEach(([assistant, proposition]) => {
            if (assistants.includes(assistant)) {
              newThreadDiv.push({ assistant, proposition, excerpt, clicked: true })
            }
          });
          if (newThreadDiv.length > 0) {
            setThreadDiv(newThreadDiv)
            setIsRightBarOpened(true)
          } 
        }
        
      }),
    ]
  });

  if (!editor) {
    return
  }


  return (<>
    <div className={styles.container}>

      <Navbar 
        newNote={newNote} 
        lastModified={lastModified} 
        assistants={assistants}
        setAssistants={setAssistants}
        setThreadDiv={setThreadDiv}
      />

      <EditingMenu editor={editor} />

      <EditorContent onClick={() => editor.commands.focus()} editor={editor} className={`${!isRightBarOpened ? styles.fullSize : styles.shrinkSize } ${styles.editor}`} />
      

      <RightBar 
        className={styles.assistantsBar}
        setIsRightBarOpened={setIsRightBarOpened}
        isRightBarOpened={isRightBarOpened}
        assistants={assistants} 
        activeAssistants={activeAssistants} 
        setAssistantsFromBar={setAssistantsFromBar}
        isLoading={isLoading}
        replaceThread={replaceThread}
        closeThread={closeThread}
        editor={editor}
        localModel={localModel}
        threadDiv={threadDiv}
        setThreadDiv={setThreadDiv}
      />
        
    </div>
    { user && <Notes newNote={newNote} setLocalId={setLocalId} /> }

  </>
  )
}