// import Avatar from 'react-avatar'

// import {Avatar} from "react-avatar";

export const Client = ({username}) => {
    return (
        <>
            <div className="client">
                {/* <Avatar name={username} size={55} round="14px" /> */}
                <span className="userName">{username}</span>
            </div>
        </>
    )
}
