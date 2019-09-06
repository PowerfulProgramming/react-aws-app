import React, { Fragment, useEffect, useReducer} from 'react';
import './App.css';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import API, { graphqlOperation } from '@aws-amplify/api'
import PubSub from '@aws-amplify/pubsub';
import { createTodo } from './graphql/mutations'
import { onCreateTodo } from './graphql/subscriptions'
import { listTodos } from './graphql/queries'
import config from './aws-exports'
//import Image from './images/videoGame.png'
import { Typography, AppBar, Toolbar, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';

API.configure(config)             // Configure Amplify
PubSub.configure(config);
Amplify.configure(aws_exports);

async function createNewTodo() {
  const todo = { name: "Use AppSync" , description: "Realtime and Offline"}
  await API.graphql(graphqlOperation(createTodo, { input: todo }))
}

const initialState = {todos:[]};
const reducer = (state, action) =>{
  switch(action.type){
    case 'QUERY':
      return {...state, todos:action.todos}
    case 'SUBSCRIPTION':
      return {...state, todos:[...state.todos, action.todo]}
    default:
      return state
  }
}
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const classes = useStyles();

  useEffect(() => {
    getData()

    const subscription = API.graphql(graphqlOperation(onCreateTodo)).subscribe({
      next: (eventData) => {
        const todo = eventData.value.data.onCreateTodo;
        dispatch({type:'SUBSCRIPTION', todo})
      }
  })
  return () => subscription.unsubscribe()
  }, [])

  async function getData() {
    const todoData = await API.graphql(graphqlOperation(listTodos))
    dispatch({type:'QUERY', todos: todoData.data.listTodos.items});
  }  
    return (
      <Fragment>
        <div className={classes.root}>
          <AppBar position="static">
            <Toolbar variant="dense">
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" color="inherit">
              <button onClick={createNewTodo}>Test </button>

              </Typography>
            </Toolbar>
          </AppBar>
        </div>
        <Typography component="div" style={{ backgroundColor: '#cfe8fc', height: '100vh', width: '100%' }} >
          <div className="App">
            <div >
            </div>
            <div>{ state.todos.map((todo, i) => <p key={todo.id}>{todo.name} : {todo.description}</p>) }</div>
          </div>
          </Typography>
      </Fragment>


    );
}

export default App;
