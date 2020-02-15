pragma solidity ^0.5.0;

contract LinkedChain {
    string public name;
    uint public postCount;
    mapping(uint => Question) public questions;

    struct Question {
        uint id;
        string question;
        uint ansCount;
        mapping(uint => Answer) answers;
        address payable author;
    }

    struct Answer {
        uint id;
        string answer;
        uint tipAmount;
        address payable author;
    }

    event QuestionCreated(
        uint id,
        string question,
        address payable author
    );

    event AnswerCreated(
        uint id,
        string answer,
        address payable author
    );

    event AnswerTipped(
        uint id,
        uint tipAmount,
        address payable author
    );

    constructor() public {
        name = "LinkedChain";
    }

    function createQuestion(string memory _question) public {
        require(bytes(_question).length > 0);
        postCount ++;
        questions[postCount] = Question(postCount, _question, 0, msg.sender);
        emit QuestionCreated(postCount, _question, msg.sender);
    }

    function createAnswer(uint _id, string memory _answer) public {
        require(bytes(_answer).length > 0);
        questions[_id].ansCount++;
        questions[_id].answers[questions[_id].ansCount] = Answer(postCount, _answer, 0, msg.sender);
        emit AnswerCreated(postCount, _answer, msg.sender);
    }

    function tipAnswer(uint _q, uint _id) public payable {
        require(_id > 0 && _id <= postCount);
        Answer memory _answer = questions[_q].answers[_id];
        address payable _author = _answer.author;
        address(_author).transfer(msg.value);
        _answer.tipAmount = _answer.tipAmount + msg.value;
        questions[_q].answers[_id] = _answer;
        emit AnswerTipped(postCount, _answer.tipAmount, _author);
    }

    function getAnswer(uint _q, uint _id) public view returns(uint, string memory, uint, address) {
        Answer memory _answer = questions[_q].answers[_id];
        return (_answer.id, _answer.answer, _answer.tipAmount, _answer.author);
    }



}
