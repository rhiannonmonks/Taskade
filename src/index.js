const { ApolloServer, gql } = require('apollo-server');
const { MongoClient, ObjectID } = require('mongodb');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
dotenv.config();


const { DB_URI, DB_NAME, JWT_SECRET } = process.env;
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const getToken = (user) => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7 days'})

const getUserFromToken = async (token, db) => {
  if (!token) { return null }

  const tokenData = jwt.verify(token, JWT_SECRET);
  if (!tokenData?.id) {
    return null;
  }

  return await db.collection('Users').findOne({ _id: ObjectID(tokenData.id) })
}

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  
  type Query{
    myTaskLists: [TaskList!]
    getTaskList(id: ID!): TaskList
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthUser!
    signIn(input: SignInInput!): AuthUser!

    createTaskList(title: String!): TaskList!
    updateTaskList(id: ID!, title: String!): TaskList!
    deleteTaskList(id: ID!): Boolean!
    addUserToTaskList(taskListId: ID!, userId: ID!): TaskList

    createToDo(content: String!, taskListId: ID!): ToDo!
  }

  input SignUpInput {
    email: String!, 
    password: String!, 
    name: String!, 
    avatar: String
  }

  input SignInInput {
    email: String!
    password: String!
  }
  
  type AuthUser {
    user: User!
    token: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
  }
  type TaskList {
    id: ID!
    createdAt: String!
    title: String!
    progress: Float!

    users: [User!]!
    todos: [ToDo!]! 
  }

  type ToDo {
    id: ID!
    content: String!
    isCompleted: Boolean!
    taskList: TaskList!
  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    myTaskLists: async (_, __, { db, user}) => {
      if(!user) { throw new Error('Authentication Error. Please sign in'); }
      
      return await db.collection('TaskList')
      .find({ userIds: user._id })
      .toArray(); 
    },

    getTaskList: async(_, { id }, { db, user }) => {
      if(!user) { throw new Error('Authentication Error. Please sign in'); }
    
      return await db.collection('TaskList').findOne({ _id: ObjectID(id )});
      
    }

  },
  
  Mutation: {
    signUp: async (_, { input }, { db }) => {
      const hashedPassword = bcrypt.hashSync(input.password);
      const newUser = {
        ...input,
        password: hashedPassword,
      }
      // save to database
      const result = await db.collection('Users').insert(newUser);
      const user = result.ops[0]
      return {
        user,
        token: getToken(user),
      }
    },

    signIn: async (_, { input }, { db }) => {
      const user = await db.collection('Users').findOne({ email: input.email });
       //check if password is correct 
      const isPasswordCorrect = user && bcrypt.compareSync(input.password, user.password);
      if (!user || !isPasswordCorrect) {
        throw new Error('Invalid credentials');
      }

      return {
        user,
        token: getToken(user),
      }
    },

    createTaskList: async(_, { title }, { db, user }) => {
      if(!user) { throw new Error('Authentication Error. Please sign in'); }

      const newTaskList = {
        title,
        createdAt: new Date().toISOString(),
        userIds: [user._id]
      }
      const result = await db.collection('TaskList').insert(newTaskList);
      return result.ops[0];
    },
    updateTaskList: async(_, { id, title }, {db, user}) => {
      if(!user) { throw new Error('Authentication Error. Please sign in'); }
      
      const result = await db.collection('TaskList')
      .updateOne({_id: ObjectID(id)}, {
        $set: {
          title
        }
      }) 

      return await db.collection('TaskList').findOne({ _id: ObjectID(id) });
    },

    addUserToTaskList: async(_, { taskListId, userId }, {db, user}) => {
      if(!user) { throw new Error('Authentication Error. Please sign in'); }
      
      const taskList = await db.collection('TaskList').findOne({ _id: ObjectID(taskListId) });
      if (!taskList) {
        return null;
      }
      if (taskList.userIds.find((dbId) => dbId.toString() === userId.toString())) {
        return taskList;
      }
      await db.collection('TaskList')
      .updateOne({_id: ObjectID(taskListId)}, {
        $push: {
          userIds: ObjectID(userId), 
        }
      }) 
      taskList.usersId.push(ObjectID(userId))
      return TaskList;
    },

    deleteTaskList: async(_, { id }, { db, user }) => {
      if(!user) { throw new Error('Authentication Error. Please sign in'); }
    
      //TODO only collabs of this task list should be able to delete
      await db.collection('TaskList').removeOne({ _id: ObjectID(id )});
      
      return true;
    },

    // ToDo Items
    createToDo: async(_, { content, taskListId }, { db, user }) => {
      if (!user) { throw new Error('Authentication Error. Please sign in'); }
      const newToDo = {
        content, 
        taskListId: ObjectID(taskListId),
        isCompleted: false,
      }
      const result = await db.collection('ToDo').insert(newToDo);
      return result.ops[0];
    },
  },

  User: {
    id: ({_id, id}) =>_id|| id
  },

  TaskList: {
    id: ({ _id, id }) =>_id|| id,
    progress: () => 0,
    users: async ({ userIds }, _, { db }) => Promise.all(
      userIds.map((userId) => (
      db.collection('Users').findOne({ _id: userId }))
      )
    )
  },

  ToDo: {
    id: ({_id, id}) =>_id|| id,
    taskList: async ({ taskListId }, _, { db }) => (
      await db.collection('TaskList').findOne({ _id: ObjectID(taskListId) })
    )
  },
};


const start = async () => {
  const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db(DB_NAME);

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ 
  typeDefs, 
  resolvers, 
  context: async ({ req }) => {
    const user = await getUserFromToken(req.headers.authorization, db);
    return {
      db,
      user,
    }
 },
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
}

start();




