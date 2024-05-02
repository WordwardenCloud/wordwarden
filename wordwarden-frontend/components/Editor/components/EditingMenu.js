import { BubbleMenu } from '@tiptap/react';
import styles from '../../../styles/EditingMenu.module.css';

export const EditingMenu = ({ editor }) => {

  return <BubbleMenu className="bubble-menu" tippyOptions={{ duration: 100 }} editor={editor}>
    <div className={styles.menu}>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${styles.menuButton} ${styles.heading1} ${editor.isActive('heading2') ? 'is-active' : ''}`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${styles.menuButton} ${styles.heading2} ${editor.isActive('heading2') ? 'is-active' : ''}`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`${styles.menuButton} ${styles.paragraph} ${editor.isActive('heading2') ? 'is-active' : ''}`}
      >
        p
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${styles.menuButton} ${styles.bold} ${editor.isActive('heading2') ? 'is-active' : ''}`}
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${styles.menuButton} ${styles.italic} ${editor.isActive('heading2') ? 'is-active' : ''}`}
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`${styles.menuButton} ${styles.underline} ${editor.isActive('heading2') ? 'is-active' : ''}`}
      >
        U
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${styles.menuButton} ${styles.bullet} ${editor.isActive('heading2') ? 'is-active' : ''}`}
      >
        ●
      </button>
    </div>
  </BubbleMenu>
}