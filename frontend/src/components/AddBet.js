import React from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const { useState } = React;

function AddBet(props) {
    const {
        showModal, handleModalHide, handleFormSubmit
    } = props;

    const [desc, setDesc] = useState("");
    const [betPrice, setbetPrice] = useState(0);
    const [bettingTime, setBettingTime] = useState(0);
    const [votingTime, setVotingTime] = useState(0);
    const [minBetterCount, setMinBetterCount] = useState(1);

    const handleDescChange = (e) => {
        setDesc(e.target.value);
    };
    const handleBetPriceChange = (e) => {
        setbetPrice(e.target.value);
    };
    const handleBettingTimeChange = (e) => {
        setBettingTime(e.target.value);
    };
    const handleVotingTimeChange = (e) => {
        setVotingTime(e.target.value);
    };
    const handleMinBetterCountChange = (e) => {
        setMinBetterCount(e.target.value);
    };

    return (
        <Modal show={showModal} onHide={handleModalHide}>
            <Modal.Header>
                <Modal.Title>Create new bet</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            placeholder="Description"
                            onChange={handleDescChange}
                            value={desc}
                        />
                        <Form.Text className="text-muted">
                            Bet info
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="formAmount">
                        <Form.Label>Bet price</Form.Label>
                        <Form.Control
                            placeholder="Bet amount"
                            onChange={handleBetPriceChange}
                            value={betPrice}
                        />
                    </Form.Group>
                    <Form.Group controlId="formWait">
                        <Form.Label>Betting time (in seconds)</Form.Label>
                        <Form.Control
                            placeholder="Betting time"
                            onChange={handleBettingTimeChange}
                            value={bettingTime}
                        />
                    </Form.Group>
                    <Form.Group controlId="formExp">
                        <Form.Label>Voting time (in seconds)</Form.Label>
                        <Form.Control
                            placeholder="Voting time"
                            onChange={handleVotingTimeChange}
                            value={votingTime}
                        />
                    </Form.Group>
                    <Form.Group controlId="formMin">
                        <Form.Label>Minimum better count</Form.Label>
                        <Form.Control
                            placeholder="Minimum better count"
                            onChange={handleMinBetterCountChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleModalHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => handleFormSubmit({desc, betPrice, bettingTime, votingTime, minBetterCount})}>
                    Add
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddBet;
