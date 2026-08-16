/* JawyXDevs style: utility pages remain cinematic industrial interfaces — near-black, technical annotation, signal blue, direct copy. */
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return <main className="not-found-page"><div className="not-found-inner"><span className="not-found-code">ERR / 404 / ROUTE NOT RESOLVED</span><h1>Page not<br /><span>found.</span></h1><p>The requested signal is not available at this address. Return to the main experience or choose another route.</p><Link href="/" className="not-found-link"><ArrowLeft size={16} /> Return home <ArrowUpRight size={16} /></Link></div></main>;
}
