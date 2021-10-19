import { Button, Container } from "reactstrap";

import "../styles/ReadyButton.css";

const ReadyButton = ({players}) => {
    const readyPlayers = players.filter(player => player.status == "ready")
    return(
        <Container className="readyButtonWrapper">
            <Button className="readyButton">준비하기</Button>
            <div>모든 플레이어가 준비 완료하면 게임이 시작됩니다.</div>
            <div>({readyPlayers.length}/{players.length})</div>
        </Container>
    )
}

export default ReadyButton;
