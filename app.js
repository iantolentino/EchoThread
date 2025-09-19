// app.js - storage, auth, helpers for client-only blog demo
/* STORAGE LAYER:
  - users: array stored in localStorage key "blog_users"
  - posts: array stored in localStorage key "blog_posts"
  - session: sessionStorage.currentUser
*/
const storage = (function(){
  const USERS_KEY = 'blog_users_v1';
  const POSTS_KEY = 'blog_posts_v1';

  function loadUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }catch(e){return [];} }
  function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function loadPosts(){ try{ return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]'); }catch(e){return [];} }
  function savePosts(p){ localStorage.setItem(POSTS_KEY, JSON.stringify(p)); }

  function getAllUsers(){ return loadUsers(); }
  function getUserById(id){ if(!id) return null; return loadUsers().find(u => u.id === id) || null; }
  function getUserByEmail(email){ if(!email) return null; return loadUsers().find(u => u.email && u.email.toLowerCase()===email.toLowerCase()) || null; }
  function getUserByName(name){ if(!name) return null; return loadUsers().find(u => u.displayName && u.displayName.toLowerCase()===name.toLowerCase()) || null; }

  function addUser(user){ const users = loadUsers(); users.push(user); saveUsers(users); }

  function getCurrentUser(){
    const id = sessionStorage.getItem('currentUser');
    if(!id) return null;
    return getUserById(id);
  }

  function ensureInit(){
    if(!localStorage.getItem(USERS_KEY)) saveUsers([]);
    if(!localStorage.getItem(POSTS_KEY)) savePosts([]);
  }

  function getAllPosts(){ return loadPosts(); }
  function getPostById(id){ return loadPosts().find(p=>p.id===id) || null; }

  function createPost({title, content}){
    const user = getCurrentUser();
    if(!user) return {success:false, message:'Login required'};
    const posts = loadPosts();
    const p = {
      id: helpers.makeId(10),
      authorId: user.id,
      title, content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: [],
      comments: []
    };
    posts.push(p); savePosts(posts); return {success:true, post:p};
  }
  function updatePost(id, {title, content}){
    const posts = loadPosts();
    const i = posts.findIndex(p=>p.id===id); if(i<0) return {success:false};
    const user = getCurrentUser(); if(!user || posts[i].authorId !== user.id) return {success:false, message:'Not allowed'};
    posts[i].title = title; posts[i].content = content; posts[i].updatedAt = Date.now();
    savePosts(posts); return {success:true};
  }
  function deletePost(id){
    const posts = loadPosts();
    const i = posts.findIndex(p=>p.id===id); if(i<0) return {success:false};
    const user = getCurrentUser(); if(!user || posts[i].authorId !== user.id) return {success:false, message:'Not allowed'};
    posts.splice(i,1); savePosts(posts); return {success:true};
  }
  function likePost(postId){
    const user = getCurrentUser(); if(!user) return {success:false, message:'Login required'};
    const posts = loadPosts(); const p = posts.find(x=>x.id===postId); if(!p) return {success:false};
    if(!p.likes.includes(user.id)) p.likes.push(user.id);
    savePosts(posts); return {success:true};
  }
  function unlikePost(postId){
    const user = getCurrentUser(); if(!user) return {success:false, message:'Login required'};
    const posts = loadPosts(); const p = posts.find(x=>x.id===postId); if(!p) return {success:false};
    p.likes = p.likes.filter(id => id !== user.id);
    savePosts(posts); return {success:true};
  }
  function isCurrentUserLiked(post){ const user = getCurrentUser(); if(!user) return false; return post.likes.includes(user.id); }

  function addComment(postId, text){
    const user = getCurrentUser(); if(!user) return {success:false, message:'Login required'};
    const posts = loadPosts(); const p = posts.find(x=>x.id===postId); if(!p) return {success:false};
    const comment = {id: helpers.makeId(10), authorId: user.id, text, createdAt: Date.now()};
    p.comments.push(comment);
    savePosts(posts); return {success:true};
  }
  function deleteComment(postId, commentId){
    const user = getCurrentUser(); if(!user) return {success:false};
    const posts = loadPosts(); const p = posts.find(x=>x.id===postId); if(!p) return {success:false};
    const ci = p.comments.findIndex(c=>c.id===commentId); if(ci<0) return {success:false};
    if(p.comments[ci].authorId !== user.id) return {success:false, message:'Not allowed'};
    p.comments.splice(ci,1); savePosts(posts); return {success:true};
  }

  function isCurrentUserOwner(post){ const u = getCurrentUser(); return !!(u && post && post.authorId === u.id); }

  return {
    ensureInit,
    getAllUsers, getUserById, getUserByEmail, getUserByName, addUser,
    getCurrentUser,
    getAllPosts, getPostById,
    createPost, updatePost, deletePost,
    likePost, unlikePost, isCurrentUserLiked,
    addComment, deleteComment,
    isCurrentUserOwner
  };
})();

// helpers & auth
const helpers = {
  makeId(len=8){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789';
    let s=''; for(let i=0;i<len;i++) s+=chars[Math.floor(Math.random()*chars.length)];
    return s;
  },
  async sha256Hex(message){
    const enc = new TextEncoder();
    const data = enc.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
};

const auth = (function(){
  async function register({displayName=null, email=null, password}){
    email = email && email.trim() || null;
    const users = JSON.parse(localStorage.getItem('blog_users_v1') || '[]');

    if(email && users.some(u=>u.email && u.email.toLowerCase()===email.toLowerCase())){
      return {success:false, message:'Email already used'};
    }

    // create user
    const id = helpers.makeId(8);
    const salt = helpers.makeId(12);
    const passwordHash = await helpers.sha256Hex(salt + password);
    const user = {id, displayName, email, salt, passwordHash, createdAt: Date.now()};
    users.push(user);
    localStorage.setItem('blog_users_v1', JSON.stringify(users));
    return {success:true, user};
  }

  async function login({idOrEmailOrName, password}){
    const users = JSON.parse(localStorage.getItem('blog_users_v1') || '[]');
    if(!idOrEmailOrName) return {success:false, message:'Enter your user ID, email or name.'};
    const q = idOrEmailOrName.trim();
    let user = users.find(u => (u.id && u.id===q) || (u.email && u.email.toLowerCase()===q.toLowerCase()) || (u.displayName && u.displayName.toLowerCase()===q.toLowerCase()));
    if(!user) return {success:false, message:'User not found'};
    const attempted = await helpers.sha256Hex(user.salt + password);
    if(attempted !== user.passwordHash) return {success:false, message:'Wrong password'};
    return {success:true, user};
  }

  return {register, login};
})();

/* initialize */
storage.ensureInit();

// convenience exports to window for pages
window.storage = {
  ensureInit: storage.ensureInit,
  getAllUsers: storage.getAllUsers,
  getUserById: storage.getUserById,
  getUserByEmail: storage.getUserByEmail,
  getUserByName: storage.getUserByName,
  addUser: storage.addUser,
  getCurrentUser: storage.getCurrentUser,
  getAllPosts: storage.getAllPosts,
  getPostById: storage.getPostById,
  createPost: storage.createPost,
  updatePost: storage.updatePost,
  deletePost: storage.deletePost,
  likePost: storage.likePost,
  unlikePost: storage.unlikePost,
  isCurrentUserLiked: storage.isCurrentUserLiked,
  addComment: storage.addComment,
  deleteComment: storage.deleteComment,
  isCurrentUserOwner: storage.isCurrentUserOwner
};
window.auth = auth;
window.helpers = helpers;
