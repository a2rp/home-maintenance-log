import { useEffect, useState } from "react";
import styles from "./App.module.css";
import SiteHeader from "./components/siteHeader";
import SiteFooter from "./components/siteFooter";
import BackToTop from "./components/backToTop";
import HomeMaintenanceLog from "./components/homeMaintenanceLog";

const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className={styles["app-shell"]} id="top">
            <SiteHeader
                title="House Ledger"
                mark="H"
                navItems={[["Maintenance", "#workspace"], ["Log a task", "#add"]]}
                repoUrl="https://github.com/a2rp/home-maintenance-log"
            />
            <main className={styles.pageContent}>
                <HomeMaintenanceLog />
            </main>
            <SiteFooter repoUrl="https://github.com/a2rp/home-maintenance-log" />
            <BackToTop visible={showBackToTop} />
        </div>
    );
};

export default App;