import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiClock, FiPlus, FiTool, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../confirmDialog";
import styles from "./styles.module.css";

const storageKey = "house-ledger-tasks";
const dateAfter = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};
const starterTasks = [
    { id: 1, title: "Replace HVAC filter", area: "Heating & cooling", nextDate: dateAfter(-2), interval: 90, complete: false, lastDone: dateAfter(-92) },
    { id: 2, title: "Test smoke alarms", area: "Safety", nextDate: dateAfter(2), interval: 180, complete: false, lastDone: dateAfter(-178) },
    { id: 3, title: "Clean range hood filter", area: "Kitchen", nextDate: dateAfter(6), interval: 60, complete: false, lastDone: dateAfter(-54) },
    { id: 4, title: "Flush water heater", area: "Plumbing", nextDate: dateAfter(24), interval: 365, complete: false, lastDone: dateAfter(-341) },
    { id: 5, title: "Clear dryer vent", area: "Laundry", nextDate: dateAfter(-18), interval: 180, complete: true, lastDone: dateAfter(-18) },
];
const readTasks = () => {
    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : starterTasks;
    } catch {
        return starterTasks;
    }
};
const shortDate = (date) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date + "T12:00:00"));

const HomeMaintenanceLog = () => {
    const [tasks, setTasks] = useState(readTasks);
    const [view, setView] = useState("All tasks");
    const [area, setArea] = useState("Every area");
    const [draft, setDraft] = useState({ title: "", area: "General", nextDate: dateAfter(7), interval: "90" });
    const [pendingDelete, setPendingDelete] = useState(null);
    useEffect(() => localStorage.setItem(storageKey, JSON.stringify(tasks)), [tasks]);

    const areas = ["Every area", ...new Set(tasks.map((task) => task.area))];
    const overdue = tasks.filter((task) => !task.complete && task.nextDate < dateAfter(0)).length;
    const thisWeek = tasks.filter((task) => !task.complete && task.nextDate >= dateAfter(0) && task.nextDate <= dateAfter(7)).length;
    const visibleTasks = useMemo(() => tasks.filter((task) => {
        const due = !task.complete && task.nextDate <= dateAfter(7);
        const matchesView = view === "All tasks" || (view === "Needs attention" ? due : task.complete);
        return matchesView && (area === "Every area" || task.area === area);
    }).sort((a, b) => a.nextDate.localeCompare(b.nextDate)), [tasks, view, area]);

    const addTask = (event) => {
        event.preventDefault();
        if (!draft.title.trim()) return;
        setTasks((current) => [...current, { ...draft, id: Date.now(), title: draft.title.trim(), interval: Number(draft.interval), complete: false, lastDone: "" }]);
        setDraft({ title: "", area: "General", nextDate: dateAfter(7), interval: "90" });
    };
    const completeTask = (task) => {
        const now = new Date().toISOString().slice(0, 10);
        setTasks((current) => current.map((item) => item.id === task.id ? { ...item, complete: true, lastDone: now } : item));
    };
    const removeTask = () => {
        setTasks((current) => current.filter((task) => task.id !== pendingDelete.id));
        setPendingDelete(null);
    };
    const markOpen = (id) => setTasks((current) => current.map((task) => task.id === id ? { ...task, complete: false } : task));

    return (
        <section className={styles.homeMaintenanceLog} id="workspace">
            <div className={styles.heading}>
                <div><p className={styles.label}>HOME CARE RECORD</p><h1>Keep the house<br /><span>running well.</span></h1><p className={styles.description}>Small jobs, on time, with a record for next time.</p></div>
                <div className={styles.houseCard}><FiTool aria-hidden="true" /><span>HOME FILE</span><strong>Everyday upkeep</strong><small>5 maintenance notes</small></div>
            </div>

            <div className={styles.metrics}>
                <div className={styles.metric}><span>Past due</span><strong className={styles.warning}>{overdue}</strong><small>needs a quick look</small></div>
                <div className={styles.metric}><span>Coming up</span><strong>{thisWeek}</strong><small>within seven days</small></div>
                <div className={styles.metric}><span>On your log</span><strong>{tasks.length}</strong><small>care reminders</small></div>
                <div className={styles.metric}><span>Service history</span><strong>{tasks.filter((task) => task.lastDone).length}</strong><small>last date recorded</small></div>
            </div>

            <div className={styles.contentGrid}>
                <section className={styles.taskPanel} aria-label="Maintenance schedule">
                    <div className={styles.panelHeading}><div><h2>Maintenance schedule</h2><p>Due dates and service notes for your home.</p></div><label className={styles.areaFilter}><span>Area</span><select value={area} onChange={(event) => setArea(event.target.value)}>{areas.map((value) => <option key={value}>{value}</option>)}</select></label></div>
                    <div className={styles.tabs} role="group" aria-label="Filter maintenance tasks">{["All tasks", "Needs attention", "Completed"].map((option) => <button key={option} type="button" className={view === option ? styles.activeTab : ""} onClick={() => setView(option)}>{option}</button>)}</div>
                    <div className={styles.taskList}>
                        {visibleTasks.map((task) => (
                            <article className={styles.taskRow} key={task.id}>
                                <span className={task.complete ? styles.completeIcon : task.nextDate < dateAfter(0) ? styles.overdueIcon : styles.taskIcon}>{task.complete ? <FiCheck aria-hidden="true" /> : <FiTool aria-hidden="true" />}</span>
                                <div className={styles.taskCopy}><h3>{task.title}</h3><p>{task.area} <span>·</span> every {task.interval} days</p></div>
                                <div className={styles.dueDate}><small>{task.complete ? "Last done" : task.nextDate < dateAfter(0) ? "Was due" : "Due next"}</small><strong>{shortDate(task.complete && task.lastDone ? task.lastDone : task.nextDate)}</strong></div>
                                {task.complete ? <button type="button" className={styles.reopenButton} onClick={() => markOpen(task.id)}>Reopen</button> : <button type="button" className={styles.doneButton} onClick={() => completeTask(task)}>Log done</button>}
                                <button type="button" className={styles.deleteButton} aria-label={"Delete " + task.title} onClick={() => setPendingDelete(task)}><FiTrash2 aria-hidden="true" /></button>
                            </article>
                        ))}
                        {visibleTasks.length === 0 && <div className={styles.emptyState}>No tasks in this view. Add a reminder below.</div>}
                    </div>
                    <form className={styles.addForm} id="add" onSubmit={addTask}>
                        <div className={styles.formHeading}><FiPlus aria-hidden="true" /><div><strong>Log a maintenance task</strong><p>Pick a date for the next check.</p></div></div>
                        <label>Task<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Check the gutters" /></label>
                        <label>Area<input value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })} /></label>
                        <label>Next date<input type="date" value={draft.nextDate} onChange={(event) => setDraft({ ...draft, nextDate: event.target.value })} /></label>
                        <label>Repeat days<input type="number" min="1" value={draft.interval} onChange={(event) => setDraft({ ...draft, interval: event.target.value })} /></label>
                        <button type="submit" className={styles.addButton}>Save task <FiPlus aria-hidden="true" /></button>
                    </form>
                </section>
                <aside className={styles.sidePanel}>
                    <span className={styles.sideIcon}><FiClock aria-hidden="true" /></span><p className={styles.label}>A SMALL ROUTINE</p><h2>Stay ahead of the fix.</h2><p>Set the next date when you add a task. When you finish it, log the work and keep the note for later.</p>
                    <div className={styles.sideRule}><span>Today</span><strong>{shortDate(dateAfter(0))}</strong></div>
                    <p className={styles.storageNote}>This log stays in your browser and can be cleared with its site data.</p>
                </aside>
            </div>
            {pendingDelete && <ConfirmDialog title="Delete this maintenance note?" description={"“" + pendingDelete.title + "” will be removed from this home log."} onCancel={() => setPendingDelete(null)} onConfirm={removeTask} />}
        </section>
    );
};

export default HomeMaintenanceLog;
