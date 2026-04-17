import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BIOLOGY_CURRICULUM } from '../constants/learning';

export const ConceptMap: React.FC = () => {
  const nodes = useMemo(() => {
    // Basic layout for 6 topics
    const layout = [
      { id: 'cell-structure', x: 200, y: 100 },
      { id: 'macromolecules', x: 200, y: 300 },
      { id: 'metabolism', x: 500, y: 200 },
      { id: 'molecular-genetics', x: 500, y: 400 },
      { id: 'population-genetics', x: 800, y: 300 },
      { id: 'biosystematics', x: 800, y: 100 }
    ];
    return layout.map(l => ({
       ...l,
       topic: BIOLOGY_CURRICULUM.find(t => t.id === l.id)
    }));
  }, []);

  const connections = useMemo(() => {
    const lines: any[] = [];
    nodes.forEach(node => {
      if (node.topic?.prerequisites) {
        node.topic.prerequisites.forEach(preId => {
          const preNode = nodes.find(n => n.id === preId);
          if (preNode) {
            lines.push({
              from: preNode,
              to: node
            });
          }
        });
      }
    });
    return lines;
  }, [nodes]);

  return (
    <div className="w-full bg-white rounded-[40px] p-8 shadow-inner overflow-hidden border border-border">
      <h3 className="text-xl font-black text-text-main mb-8 flex items-center gap-2">
        Biomap: Koneksi Antar Konsep 🕸️
      </h3>
      
      <div className="relative w-full aspect-video min-h-[400px]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="20" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
            </marker>
          </defs>
          
          {connections.map((conn, i) => (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)"
            />
          ))}

          {nodes.map((node, i) => (
            <g key={node.id}>
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: i * 0.1 }}
                cx={node.x}
                cy={node.y}
                r="45"
                fill="white"
                stroke={node.topic?.level === 1 ? '#3B82F6' : node.topic?.level === 2 ? '#8B5CF6' : '#F59E0B'}
                strokeWidth="3"
                className="shadow-lg"
              />
              <motion.text
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-black fill-text-main pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                {node.topic?.title.split(' ').map((word, idx) => (
                  <tspan key={idx} x={node.x} dy={idx === 0 ? 0 : 12}>{word}</tspan>
                ))}
              </motion.text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-text-muted">Foundation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-[10px] font-bold text-text-muted">Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-[10px] font-bold text-text-muted">Olympic</span>
        </div>
      </div>
    </div>
  );
};
