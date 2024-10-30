import Image from "next/image";
import styles from "./page.module.css";
import DocumentUpload from "@/components/DocumentUpload/DocumentUpload";
import SearchComponent from "@/components/SearchComponent/SearchComponent";
import DocumentManager from "@/components/DocumentManager/DocumentManager";
import DocumentProcessor from "@/components/DocumentProcessor/DocumentProcessor";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>testing reports page</main>
    </div>
  );
}
