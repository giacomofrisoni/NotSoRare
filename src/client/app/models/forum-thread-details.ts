export class ForumThreadDetails {
    code: number;
    title: string;
    description: string;
    views: number;
    creation_date: Date;
    update_date: Date;
    past_time: PastTime;
    author: Author;
    messages: Message[];
}

interface Message {
    utility: number;
    _id: string;
    content: string;
    _authorId: string;
    _forumThreadId: string;
    creation_date: Date;
    update_date: Date;
    utility_votes: any[];
    code: number;
    __v: number;
    past_time: PastTime;
    comments: Comment[];
    id: string;
}

interface Author {
    code: number;
    is_anonymous: boolean;
    first_name: string;
    last_name: string;
    fullname: string;
    photo: string;
    gender: string;
    age: number;
}

interface PastTime {
    duration: number;
    unit: string;
}
