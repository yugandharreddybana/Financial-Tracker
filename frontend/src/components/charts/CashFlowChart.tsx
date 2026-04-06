import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
interface Props { data:{date:string;projectedBalance:number;eventDescription?:string}[]; }
const CashFlowChart: React.FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <LineChart data={data} margin={{top:5,right:5,left:0,bottom:0}}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
      <XAxis dataKey="date" tick={{fontSize:9,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>v.slice(5)} />
      <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
      <Tooltip formatter={(v:any)=>[`€${Number(v).toFixed(2)}`,"Projected"]} contentStyle={{borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"12px"}} />
      <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 2" />
      <Line type="monotone" dataKey="projectedBalance" stroke="#3B82F6" strokeWidth={2} dot={(p)=>p.payload.eventDescription?<circle cx={p.cx} cy={p.cy} r={4} fill="#F97316" />:<></>} />
    </LineChart>
  </ResponsiveContainer>
);
export default CashFlowChart;
