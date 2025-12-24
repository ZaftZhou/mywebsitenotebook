import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { SKILLS } from '../../constants';
import { Download, ExternalLink } from 'lucide-react';

export const AboutApp: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-paper">
      <div className="max-w-2xl mx-auto bg-white border-2 border-ink p-8 rounded-sm shadow-sm relative rotate-1">
        <div className="absolute -top-4 -left-4 bg-catApp text-white text-xs font-bold px-3 py-1 rounded border-2 border-ink rotate-[-10deg] shadow-sm">
          HIRED!
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <h2 className="font-hand text-3xl font-bold mb-4 border-b-2 border-dashed border-ink/20 pb-2">Profile Card</h2>
            <div className="font-sans space-y-4 text-sm leading-relaxed text-gray-800">
              <p>
                I build <span className="bg-tape px-1 font-bold mx-1">end-to-end interactive experiences</span> — from 3D scanning & reconstruction to Unity systems and playful web products.
              </p>
              <p>
                Based in Turku, Finland. I bridge the gap between technical art and software engineering, focusing on ship-ready prototypes and vibe-coding experiments.
              </p>
            </div>

            <div className="mt-8">
              <h4 className="font-hand font-bold text-lg mb-2">Experience</h4>
              <ul className="text-xs font-mono space-y-2 text-gray-600 border-l-2 border-ink/10 pl-3">
                <li>
                  <span className="font-bold text-ink">2022 - Present</span>
                  <br />Personal Projects & Prototyping
                  <div className="text-[10px] text-gray-400">Unity • React Native • Web</div>
                </li>
                <li>
                  <span className="font-bold text-ink">2022 - 2025</span>
                  <br />Turku Univ. of Applied Sciences
                  <div className="text-[10px] text-gray-400">ICT Engineering Student</div>
                </li>
                <li>
                  <span className="font-bold text-ink">2017 - 2022</span>
                  <br />3D Interactive Content Developer
                  <div className="text-[10px] text-gray-400">Full Pipeline (Scan to Web/VR)</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="w-full h-48 bg-paperDark rounded border border-ink/10 mb-4 p-2 relative">
              <div className="absolute top-2 left-2 text-[10px] font-mono text-gray-400">SKILL_MATRIX.exe</div>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILLS}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#18181b"
                    strokeWidth={2}
                    fill="#F4E04D"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <button
              onClick={() => alert("CV Downloaded!")}
              className="group w-full py-3 flex items-center justify-center gap-2 border-2 border-ink rounded bg-white hover:bg-tape transition-colors shadow-paper hover:shadow-paper-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-paper"
            >
              <Download className="w-4 h-4" />
              <span className="font-bold text-xs uppercase tracking-wider">Download CV</span>
            </button>
            <div className="mt-2 flex gap-2 w-full">
              <a href="#" className="flex-1 text-center py-2 text-[10px] font-bold border border-ink/20 rounded hover:bg-paperDark">LINKEDIN</a>
              <a href="#" className="flex-1 text-center py-2 text-[10px] font-bold border border-ink/20 rounded hover:bg-paperDark">GITHUB</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
