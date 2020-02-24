import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import { Card, Button, Grid, Label } from 'semantic-ui-react';
import Identicon from 'identicon.js';
import Navbar from './Navbar';
import 'semantic-ui-css/semantic.min.css';
import LinkedChain from '../abis/LinkedChain.json';
import { NavLink } from 'react-router-dom';
import Route from 'react-router-dom/Route';
import Answers from './Answers.js'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    this.renderQuestions()

  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = LinkedChain.networks[networkId]
    if (networkData) {
      const linkedChain = web3.eth.Contract(LinkedChain.abi, networkData.address)
      this.setState({ linkedChain })
      // Load Posts
      const p = await linkedChain.methods.postCount().call()
      const postCount = p.toNumber()
      this.setState({ postCount })
      for (var i = 1; i <= postCount; i++) {
        const post = await linkedChain.methods.questions(i).call()
        this.setState({
          posts: [...this.state.posts, post.question],
          ask: [...this.state.ask, post.author],
          q: [...this.state.q, post.ansCount.toNumber()]
        })
        const ansCount = post.ansCount
        ansCount = ansCount.toNumber()
        if (ansCount > 0) {
          let arr = new Array() // To store answers of question 1 at index 1 and so on
          for (var j = 1; j <= ansCount; j++) {
            const ans = await linkedChain.methods.getAnswer(i, j).call()
            arr.push(ans[1])
            this.setState({
              tipAmounts: [...this.state.tipAmounts, ans[2].toNumber()],
              authors: [...this.state.authors, ans[3]]
            })
          }
          this.state.answers[i] = arr
        }
      }

      // Sort posts. Show highest tipped posts first
      this.setState({
        posts: this.state.posts.sort((a, b) => b.tipAmount - a.tipAmount)
      })
    } else {
      window.alert('LinkedChain contract not deployed to detected network.')
    }
  }

  async createQuestion(content) {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = LinkedChain.networks[networkId]
    const linkedChain = web3.eth.Contract(LinkedChain.abi, networkData.address)
    this.setState({ linkedChain })
    await linkedChain.methods.createQuestion(content).send({ from: this.state.account }).then(setTimeout(function () { window.location.reload(true) }, 29000))
  }

  renderQuestions() {
    const items = this.state.posts.map((post, index) => {
      return {
        header: (<div><h3>Question : {post}</h3></div>),
        description: (
          <div>
            <hr />
            <NavLink to={`/answer/${index + 1}`} activeStyle={{ color: 'green' }}>
              <h5>
                View Answers
          </h5>
            </NavLink>
            <Route path={`/answer/${index + 1}`} exact strict component={this.renderAnswers} />
          </div>

        ),
        meta: (
          <div>
            <hr size="20" noshade />
            Author :
          <img
              className='ml-2'
              width='30'
              height='30'
              src={`data:image/png;base64,${new Identicon(this.state.ask[index], 30).toString()}`}
            />
            {this.state.ask[index]}
          </div>),
        fluid: true
      };
    })
    return <Card.Group items={items} />;
  }

  renderExtras() {
    const items = [
      {
        header: (<div><Label size="large">Need to raise funds?</Label></div>),
        description:
          (<div>  <hr /><a href="https://ethsupport.herokuapp.com/campaigns/new"><Button primary size="large">Use EthSupport</Button></a>
          </div>),
        meta: (<div><Label as='a' color='green' size="mini" tag>
          create a campaign
      </Label></div>)
      },
      {
        header: (<div><Label size="large">Want protection from deepfake?</Label></div>),
        description:
          (<div><hr /> <a href="https://deepfake-protector.herokuapp.com/"><Button primary size="medium">Use Deepfake Protector</Button></a>
          </div>),
        meta: (<div><Label as='a' color='green' size="mini" tag>
          upload your files
      </Label></div>)
      },
      {
        header: (<div><Label size="large">Play Ether Lottery?</Label></div>),
        description:
          (<div><hr /> <a href="https://ethereum-lottery-game.netlify.com/"><Button primary size="large">Lottery</Button></a>
          </div>),
        meta: (<div><Label as='a' color='green' size="mini" tag>
          play a game
      </Label></div>)
      },

    ]
    return <Card.Group items={items} />;
  }

  renderAnswers({ match }) {
    const id = match.path.slice(8)
    const num = this.state.q[id]
    const answers = this.state.answers[id]
    return <Answers q={id} answers={answers} tipAmounts={this.state.tipAmounts.slice(id - 1)} authors={this.state.authors} />;
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      accounts: [],
      ask: [],
      linkedChain: null,
      postCount: 0,
      posts: [],
      answers: [],
      q: [],//list of number of answers
      tipAmounts: [],
      authors: []
    }
    this.renderAnswers = this.renderAnswers.bind(this)
  }


  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <p>&nbsp;</p>
        <br />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '700px' }}>
              <div className="content mr-auto ml-auto">
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const content = this.postContent.value
                  this.createQuestion(content)
                }}>
                  <div className="form-group mr-sm-2">
                    <input
                      id="postContent"
                      type="text"
                      ref={(input) => { this.postContent = input }}
                      className="form-control"
                      placeholder="What's your question?"
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Add Question</button>
                </form>
              </div>
            </main>
            <p>&nbsp;</p>
          </div>
          <div className="container-fluid mt-5">
            <div className="row">
              <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '830px' }}>
                <div className="content mr-auto ml-auto" width="700">
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={11}>{this.renderQuestions()}</Grid.Column>

                      <Grid.Column width={5}>
                        {this.renderExtras()}

                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default App;
