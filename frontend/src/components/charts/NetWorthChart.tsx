import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
interface Props { data:{month:string;netWorth:number}[]; }
const NetWorthChart: React.FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <AreaChart data={data} margin={{top:5,right:5,left:0,bottom:0}}>
      <defs><linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366F1" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
      <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
      <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
      <Tooltip formatter={(v:any)=>[`€${Number(v).toFixed(2)}`,"Net Worth"]} contentStyle={{borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"12px"}} />
      <Area type="monotone" dataKey="netWorth" stroke="#6366F1" strokeWidth={2} fill="url(#nwGrad)" />
    </AreaChart>
  </ResponsiveContainer>
);
export default NetWorthChart;
