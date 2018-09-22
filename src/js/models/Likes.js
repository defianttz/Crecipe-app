export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, img) {
        const like = {id, title, author, img};
        this.likes.push(like);

        //Persit data in local storage
        this.persistData();
        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index, 1);
        
        //Persist Data
        this.persistData();
    }

    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getNumofLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));
        
        //Restore likes from Local Storage
        if(storage) this.likes = storage;
    }
}