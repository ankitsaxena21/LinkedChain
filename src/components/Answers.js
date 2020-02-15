import React, { Component } from 'react';
import './App.css';
import Identicon from 'identicon.js';
import { Button, Label, Form, Grid, Card, Input } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import LinkedChain from '../abis/LinkedChain.json';

class Answers extends Component {

  renderCards() {
    const {
       q,
       answers,
       tipAmounts,
       authors
    } = this.props;
    if(this.props.answers){
      const items = this.props.answers.map((post, index) => {
        return {
          header: (
            <div>
            <h4>Answer {index + 1} : {answers[index]}</h4>
            <hr/>
            </div>),
          description: (
            <div>
            Tips: {(tipAmounts[index]/10000000)*0.01} Eth
            <hr />
            <Label>Tip 0.01 ether to this answer</Label>
            <Button positive onClick={(event) => {
              let tipAmount = window.web3.utils.fromWei('10000000000000000', 'Gwei')
              this.tipAnswer(this.props.q, index+1, window.web3.utils.toBN(tipAmount))
            }}>Tip Ether</Button>
            </div>
          ),
          meta : (
            <div>
            Answered By:
            <img
             className='ml-2'
             width='30'
             height='30'
             src={`data:image/png;base64,${new Identicon(authors[index], 30).toString()}`}
           />
           {authors[index]}
           <hr/>
          </div>),
          fluid: true
        };
    })

      return <Card.Group items={items} />;
    }
  }

async tipAnswer(q, index, tipAmount) {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    const networkId = await web3.eth.net.getId()
    const networkData = LinkedChain.networks[networkId]
    const linkedChain = web3.eth.Contract(LinkedChain.abi, networkData.address)
    await linkedChain.methods.tipAnswer(q, index).send({ from: accounts[0], value: tipAmount }).then(setTimeout(function(){window.location.reload(true)},22000))
  }
async createAnswer(q, content) {
      const web3 = window.web3
      const accounts = await web3.eth.getAccounts()
      const networkId = await web3.eth.net.getId()
      const networkData = LinkedChain.networks[networkId]
      const linkedChain = web3.eth.Contract(LinkedChain.abi, networkData.address)
      await linkedChain.methods.createAnswer(q, content).send({ from: accounts[0]}).then(setTimeout(function(){window.location.reload(true)},22400))

    }
  constructor(props){
    super(props)
    this.state={
      tips:'',
      ans : ''
    }
  }

  render() {
    let ans
    console.log(this.props.tipAmounts);
    return (
      <div>
        <br/>
        <Label as='a' color='teal' tag>
        Answers</Label>
        <Grid>
          <Grid.Row>
            <Grid.Column>{this.renderCards()}
            </Grid.Column>
            </Grid.Row>
          <Grid.Row>
          <Grid.Column>
            <Form.Field >
          <Input
            size="large"
            label="My Answer"
            labelPosition="left"
            placeholder="Write an answer..."
            value={this.state.ans}
              onChange={event =>
                this.setState({ ans: event.target.value })
              }
          />
            <a>
              <Button primary onClick={(event) => {
                this.createAnswer(this.props.q, this.state.ans)
              }}>Add Answer!</Button>
            </a>
        </Form.Field>
        </Grid.Column>
      </Grid.Row>

        </Grid>
        </div>
    );
  }
}


export default Answers;
