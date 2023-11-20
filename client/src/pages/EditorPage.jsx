import { useEffect, useRef, useState } from "react"
import { Client } from "../components/Client";
import { Editor } from "../components/Editor";
import initSocket from "../../socket";
import ACTIONS from "../Actions";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { func } from "prop-types";


export const EditorPage = () => {

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  // console.log(roomId)
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {

      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
      }

      //connection with the port 4000
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      //joined users event
      socketRef.current.on(ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} unio a la sala`);
            console.log(`${username} unido`);
          }

          setClients(clients);
          //code async
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          })
          
        });

      //listen disconected users from room
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        if (username) {
          toast.success(`${username} dejo la sala`);
          setClients((prevClients) => {
            return prevClients.filter(client => client.socketId !== socketId);
          });
        }
      });
    }

    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    }

  }, []);

   async function copyRoomId(){
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copiado');
    } catch (error) {
      toast.error('No se puede copiar el Room ID');
      console.log(error);
    }
  }

  function leaveRoom(){
    reactNavigator('/');
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="homePageLogo" src="/logo-escuela.png" alt="logo-escuela" />
          </div>

          <h3>Conectados</h3>

          <div className="clientsList">
            {
              clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))
            }
          </div>
        </div>

        <button className="btn copyBtn" onClick={copyRoomId}>Copear ROOM ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Salir</button>
      </div>

      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => { codeRef.current = code }}
        />
      </div>
    </div>
  )
}
