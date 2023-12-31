import { useEffect, useRef, useState } from "react";
import { Client } from "../components/Client";
import { Editor } from "../components/Editor";
import initSocket from "../../socket";
import ACTIONS from "../Actions";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

export const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  // console.log(roomId)
  const [clients, setClients] = useState([]);

  // Mandar datos a servidor par acompilar python
  const [codigo, setCodigo] = useState("hola");
  const [outputcode, setOutputcode] = useState("");
  const [isCodeCompiled, setIsCodeCompiled] = useState(false); 

  const mandarCodigo = () => {
    console.log(codigo);
  };
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      //connection with the port 4000
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      //joined users event
      socketRef.current.on(
        ACTIONS.JOINED,
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
          });
        }
      );

      //listen disconected users from room
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        if (username) {
          toast.success(`${username} dejo la sala`);
          setClients((prevClients) => {
            return prevClients.filter((client) => client.socketId !== socketId);
          });
        }
      });
    };

    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, []);


  
  const postCode = async () => {
    const settings = {
      method: "POST",
      body:JSON.stringify({src_code: codigo}),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    try {
      // const url = [process.env.PORT_CODE];
      // console.log(url);
      const fetchResponse = await fetch(
        `http://35.239.156.166:80/submit_code`,       
        settings
      );
      const data = await fetchResponse.json();
      // console.log(data.output);
      // setCodigo(data.output);
      setIsCodeCompiled(true);
      console.log("Desde PostCode " + data.output);
      return data.output;
      // console.log(data.output)
      // return data;
    } catch (e) {
      return e;
    }
  };

  const CompilerBtn = async () => {
    const output = await postCode();
    // setCodigo(output);
    console.log("Desde compiler btn " + output);
    // const formattedOutput = output.replace(/\n/g, "<br>");
    setOutputcode(output);
  };


  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copiado");
    } catch (error) {
      toast.error("No se puede copiar el Room ID");
      console.log(error);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img
              className="homePageLogo"
              src="/logo-escuela.png"
              alt="logo-escuela"
            />
          </div>

          <h3>Conectados</h3>

          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <button className="btn compilerBtn"  onClick={CompilerBtn}> Compilar</button>

        <button className="btn copyBtn" onClick={copyRoomId}>
          Copear ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Salir
        </button>
      </div>
      

      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
            setCodigo(code);
          }}
          setCodigo={setCodigo}
        />
      </div>
      

      <div className="outputEditor">
        {isCodeCompiled && <div className="outputConsole">{outputcode}</div>}
      </div>
      
    </div>
  );
};
