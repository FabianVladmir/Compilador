import { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from "../Actions";

export const Editor = ({ socketRef, roomId, onCodeChange}) => {

  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {

      const textArea = document.getElementById('realTimeEditor');
      const extensions = {
        mode: 'javascript',
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      };

      editorRef.current = Codemirror.fromTextArea(textArea, extensions);

      //Code local and emit other clients
      const handleCodeChange = (instance, changes) => {
        const { origin } = changes; //cut, paste, input, ...
        const code = instance.getValue();
        // Sync code for future users
        onCodeChange(code);

        // Emit the code change to other clients in the same room
        if (origin !== 'setValue' && socketRef.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      };

      editorRef.current.on('change', handleCodeChange);
    }

    init();
  }, []);

  useEffect(() => {
    // Listen for code changes from other clients
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      if (socketRef.current) {
          socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
  };
  }, [socketRef.current])

  return <textarea id="realTimeEditor"></textarea>;
};

