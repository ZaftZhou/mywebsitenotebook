import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AppId } from '../../types';
import { FileText, Folder } from 'lucide-react';
import { useSettings } from '../../src/hooks/useContent';

interface WelcomeAppProps {
  openApp: (id: AppId, props?: any) => void;
}

export const WelcomeApp: React.FC<WelcomeAppProps> = ({ openApp }) => {
  const d3Container = useRef<SVGSVGElement>(null);
  const { settings } = useSettings();

  useEffect(() => {
    if (!d3Container.current) return;

    const svg = d3.select(d3Container.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 60;
    const dataPoints = 20;

    const x = d3.scaleLinear().domain([0, dataPoints - 1]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 60]).range([height, 0]);

    const line = d3.line<number>()
      .x((d, i) => x(i))
      .y(d => y(d))
      .curve(d3.curveBasis);

    const path = svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "#18181b")
      .attr("stroke-width", 2);

    function animate() {
      // Generate new random smooth data
      const data = d3.range(dataPoints).map(() => Math.random() * 40 + 10);

      path.datum(data)
        .attr("d", line)
        .attr("opacity", 1);

      const totalLength = path.node()?.getTotalLength() || width;

      path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(4000) // Slower draw: 4 seconds
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .transition()
        .duration(1000) // Hold for 1 second
        .transition() // Fade out
        .duration(1000)
        .attr("opacity", 0)
        .on("end", animate);
    }

    animate();

  }, []);

  const greeting = settings?.welcome?.greeting || "Hello, I'm Zhou Bowen.";
  const tagline = settings?.welcome?.tagline || "Unity Dev • Tech Artist • Turku, Finland 🇫🇮";

  return (
    <div className="flex flex-col items-center justify-center h-full text-center relative p-4 bg-paper">
      <div className="w-20 h-20 bg-paperDark border-2 border-ink rounded-full mb-4 flex items-center justify-center text-3xl shadow-sm rotate-2 overflow-hidden">
        {settings?.welcome?.avatarUrl ? (
          <img src={settings.welcome.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          '👋'
        )}
      </div>
      <h1 className="font-hand font-bold text-4xl md:text-5xl mb-2">{greeting}</h1>
      <p className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-6 bg-white px-2 py-1 border border-ink/10 rounded">
        {tagline}
      </p>

      {/* D3 System Monitor */}
      <div className="mb-8 opacity-50 grayscale hover:grayscale-0 transition-all">
        <div className="text-[9px] font-mono text-left w-[200px] mb-1">SYSTEM_ACTIVITY_MONITOR</div>
        <svg ref={d3Container} width={200} height={60} className="border-b border-ink/20"></svg>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
        <button
          onClick={() => openApp('projects')}
          className="bg-catUnity border-2 border-ink py-3 rounded-lg font-bold shadow-paper hover:translate-y-[-2px] hover:shadow-paper-hover transition-all flex flex-col items-center text-sm md:text-base group"
        >
          <Folder className="mb-1 w-6 h-6 group-hover:scale-110 transition-transform" />
          <span>View Projects</span>
        </button>
        <button
          onClick={() => {
            if (settings?.profile.resumeUrl) {
              window.open(settings.profile.resumeUrl, '_blank');
            } else {
              alert("No CV uploaded yet. Configure it in Admin Panel.");
            }
          }}
          className="bg-white border-2 border-ink py-3 rounded-lg font-bold shadow-paper hover:translate-y-[-2px] hover:shadow-paper-hover transition-all flex flex-col items-center text-sm md:text-base group"
        >
          <FileText className="mb-1 w-6 h-6 group-hover:scale-110 transition-transform" />
          <span>Download CV</span>
        </button>
      </div>

      <button
        onClick={() => openApp('projects', { mode: 'classic' })}
        className="text-xs font-bold text-gray-400 hover:text-ink underline decoration-dashed"
      >
        &rarr; View Selected Work (Classic List)
      </button>
    </div>
  );
};
