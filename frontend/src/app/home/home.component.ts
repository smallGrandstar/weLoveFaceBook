import { Component, OnInit, Input, Inject } from '@angular/core';
import { Post } from '../post';
import { User } from '../user';
import { PostService } from '../post.service';
import { UserService } from '../user.service';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { Comment } from '../comment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  
  @Input() curUsername: string;
  post: Post = new Post();
  curUser: User = new User();
  homePosts: Array<Post> = [];
  commentContent: String;

  spaceScreens: Array<any> = [];
  start = 0;
  end = 0;
  pageIndex = 0;
  pageSize = 2;
  pageSizeOptions = [1, 2, 5, 10];
  
  constructor(private userService: UserService, private postService: PostService, private http: Http, public dialog: MdDialog) {
    // this.http.get('assets/mock-data-home/data.json')
    // .map(response => response.json().screenshots)
    // .subscribe(res => this.spaceScreens = res);
  }

  ngOnInit() {
    // get all user information from database and assign to user and useredit
    this.userService.getUserByUsername(this.curUsername).then(data => {
      this.curUser = data
      this.getHomeposts();
    });
   
    this.end = this.start + this.pageSize;
  }

  refreshSelfposts(e) {
    this.getHomeposts();
  }

  sendPost() {
    this.post.title = 'wedontneedtitle';
    this.post.createdBy = this.curUsername;
    this.postService.sendPost(this.post).then(data => {
      if (data.success === true) {
        this.getHomeposts();  // refresh homepage after send new post
        console.log("New post sent successfully ",this.post);
      }else {
        console.log("Fail to add new post: ",data.message)
      }
    });
    // clear make post form
    this.post = new Post();
  }

  getHomeposts() {
    this.postService.getHomePosts(this.curUser).then(data => {
      if (data.success === true) {
        this.homePosts = data.posts;
        console.log("Home posts got from database", this.homePosts);
      }else {
        console.log("Error when getting self post from database: ",data.message);
      }
    });
  }

  likeCancelLikePost(i) {
    let likedpost:Post = this.homePosts[i];
    let likinguser: String = this.curUsername;
    this.postService.addOrCancelLikePosts(likedpost,likinguser).then(data => {
      if (data.success === true) {
        this.getHomeposts();  // refresh homepage after liked
        // console.log("liked successfully ",this.post);
      }else {
        console.log("Fail to like -- err msg from home component ",data.message)
      }
    });
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.start = (this.pageIndex + 1) * this.pageSize - this.pageSize;
    this.end = (this.pageIndex + 1) * this.pageSize;
  }

  openDialog(i): void {
    let dialogRef = this.dialog.open(AddCommentComponent, {
      width: '250px',
      data: { commentContent: this.commentContent }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        let commentedpost: Post = this.homePosts[i];
        this.commentContent = result.commentContent;
        if(this.commentContent !== '') {
          const newComment = new Comment;
          newComment.comment = this.commentContent;
          newComment.commentator = this.curUsername;
          commentedpost.comments.push(newComment);
          this.postService.updateComment(commentedpost);
        }
        console.log('postID: ' + commentedpost._id + 'comment: ' + this.commentContent);
      }
    });
  }
deleteComment(comment, i){
  let commentedpost: Post = this.homePosts[i];
  const index = commentedpost.comments.indexOf(comment);
  commentedpost.comments.splice(index,1);
  this.postService.updateComment(commentedpost);
}

}
@Component({
  selector: 'app-addcomment',
  templateUrl: './addComment.html',
})
export class AddCommentComponent {

  constructor(
    public dialogRef: MdDialogRef<AddCommentComponent>,
    @Inject(MD_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}