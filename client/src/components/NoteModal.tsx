import React from "react";
import styles from "./NoteModal.module.css";

interface NoteModalProps {
  note: string;
  onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ note, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Job Note</span>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          {note ? (
            <pre className={styles.note}>{note}</pre>
          ) : (
            <span className={styles.empty}>No note for this job.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
