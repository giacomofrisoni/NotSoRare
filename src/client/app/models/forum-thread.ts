export class ForumThread {
    code: number;
    title: string;
    description: string;
    views: number;
    messages_count: number;
    last_activity_date: Date;
    author: Author;
}

interface Author {
    code: number;
    is_anonymous: boolean;
    first_name: string;
    last_name: string;
    fullname: string;
    photoURL: string;
}