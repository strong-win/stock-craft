import {Container, Row, Col} from "reactstrap";

import Tutorial from "../components/Tutorial";
import PlayersWrapper from "../containers/PlayersWrapper";
import ReadyWrapper from "../containers/ReadyWrapper";
import ChattingWrapper from "../containers/ChattingWrapper";
import Header from "../components/Header";

import "../styles/WaitingRoom.css";

type WaitingRoomProps = {
	room: string;
	name: string;
}

const WaitingRoom = ({room, name}: WaitingRoomProps) => {
    return(
    <Container className="WaitingRoomContainer" fluid={true}>
			<Header/>
			<Row className="body">
				<Col md="8" className="p-0">
					<Row><Tutorial/></Row>
					<Row>
						<Col><PlayersWrapper room={room} /></Col> 
						<Col><ReadyWrapper /></Col>
					</Row>
				</Col>
				<Col md="4" className="p-0">
					<ChattingWrapper room={room} name={name}/>
				</Col>
			</Row>
		</Container>
    );
}

export default WaitingRoom;
