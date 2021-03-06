import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {  } from "../../actions";
import { socket } from "../../socket";
import ThreadPanel from "./ThreadPanel";
import PaginationControls from "./Pagination";
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));



export default function Forum(props) {
    const classes = useStyles();

    useEffect(() => {
        let offset = props.match.params.forumPage * 10 - 10;

        socket.emit("getThreadsByForumId", {
            forumId: props.match.params.forumId,
            offset: offset
        });

        window.scrollTo(0, 0);
    },[props.match.params])

    const threads = useSelector(state => state.threads);
    const numThreads = useSelector(state => state.threads && state.threads[0] && state.threads[0].totalThreads)

    const dateFormat = dateStr => {
        const [year, month, day] = dateStr.split("T")[0].split("-");
        const [hours, minutes, seconds] = dateStr.split("T")[1].split(".")[0].split(":");
        const date = new Date(Date.UTC(year, `${parseInt(month)-1}`, day, hours, minutes));
        const options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric',
            hour12: true, timeZone: 'Europe/Berlin'
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    const clickHandler = thread => {
        props.history.push(`/forums/${props.match.params.forumId}/${thread.title.replace(/\W/g, ' ').split(" ").join("-")}.${thread.id}/page-1`);
    };

    const newThread = e => {
        e.preventDefault();
        console.log("I've been clicked", e);
        props.history.push(`/forums/${props.match.params.forumId}/new-thread`);
    };

    return (
        <>
        {
            numThreads && numThreads > 10 &&
            <PaginationControls
                history={props.history}
                match={props.match}
                numPages={Math.ceil(threads.length / 10) || 1}
                hidePrevNext={false}
                currentPage={parseInt(props.match.params.forumPage)}
            />
        }

        <div>
            <Button variant="outlined" color="primary" startIcon={<LibraryAddIcon />} onClick={newThread}>
                Post new thread
            </Button>
        </div>

        {threads && threads.map(thread => (
            <ThreadPanel
                children={
                    <div>
                        <h3 className="clickable" onClick={() => clickHandler({title: thread.title, id: thread.id})}>{thread.title}</h3>
                        <span>Started by {thread.first} {thread.last} </span>
                        <span>on {dateFormat(thread.created_at)}  </span>
                        <span>Posts: {thread.numberOfPosts}</span>

                            <PaginationControls
                                history={props.history}
                                match={props.match}
                                numPages={Math.ceil(thread.numberOfPosts / 10) || 1}
                                currentPage={1}
                                hidePrevNext={true}
                                link={`/forums/${props.match.params.forumId}/${thread.title.replace(/\W/g, ' ').split(" ").join("-")}.${thread.id}/page-`}
                            />

                    </div>
                }
            />
        ))}

        {
            numThreads && numThreads > 10 &&
            <PaginationControls
                history={props.history}
                match={props.match}
                numPages={Math.ceil(threads.length / 10) || 1}
                hidePrevNext={false}
                currentPage={parseInt(props.match.params.forumPage)}
            />
        }
        </>
    )
}
// ${thread.title.split(" ").join("-")}
