let db = {
  screams: [
    {
      userHandle: 'user',
      body: 'this is the scream body',
      createdAt: '2021-02-02T20:07:57.327Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  users: [
    {
      userId: 'dgj872784bfn2874hg27h4',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2021-02-02T20:07:57.327Z',
      imageUrl: 'image/jsdfniwf/svnkr4vks',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'London, UK'
    }
  ],
  comments: [
    {
      userHandle: 'user',
      screamId: 'h955ng957euj249m8',
      body: 'nice text message',
      createdAt: '2021-02-02T20:07:57.327Z'
    }
  ]
}



const userDetails = {
  // Redux data
  credentials: {
      userId: 'dgj872784bfn2874hg27h4',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2021-02-02T20:07:57.327Z',
      imageUrl: 'image/jsdfniwf/svnkr4vks',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'London, UK'
  },
  likes: [
    {
      userHandle: 'user',
      screamId: 'wjgn3487hgn394bh'
    },
    {
      userHandle: 'user',
      screamId: 'mbkj8674hhdthj'
    }
  ]
}
