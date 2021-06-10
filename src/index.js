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
  }

  type Mutation {
    signUp(input: SignUpInput): AuthUser!
    signIn(input: SignInInput): AuthUser!
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

    taskListId: TaskList!

  }
`;

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    myTaskLists: () => []
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
    }
  },

  User: {
    id: ({_id, id}) =>_id|| id
  }
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




