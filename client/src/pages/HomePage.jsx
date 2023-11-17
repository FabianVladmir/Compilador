import { useState } from "react"
import {v4 as uuidv4}  from "uuid";
import {toast} from "react-hot-toast";  
import { useNavigate } from "react-router-dom";

export const HomePage = () => {

    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');


    const createNewRoom = (e) =>{
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success('Nueva sala creada');
    }

    const joinRoom = () =>{
        if(!roomId || !username){
            toast.error('Room ID & nombre de usuario son requeridos');
            return;
        }

        navigate(`/editor/${roomId}`, {
            state: {
                username
            },
        });     
        
    }

    const handleInputEnter = (e) => {
        if (e.code === "Enter") {
            joinRoom();
        }
    };

    return (
        <div className="homePageWrapper">

            <div className="formWrapper">
                <img className="homePageLogo" src="/logo-escuela.png" alt="logo-escuela" />
                <h4 className="mainLabel">Pegar invitación ROOM ID</h4>

                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => { setRoomId(e.target.value) }}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />

                    <input
                        type="text"
                        className="inputBox"
                        placeholder="NOMBRE"
                        onChange={(e) => { setUsername(e.target.value) }}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />

                    <button className="btn joinBtn" onClick={joinRoom} >JOIN</button>

                    <span className="createInfo">Si no dispone de un código de invitación, cree &nbsp;
                        <a
                            onClick={createNewRoom}
                            href="google.com"
                            className="createNewBtn">nueva sala
                        </a>
                    </span>
                </div>
            </div>
        </div>
    )
}
