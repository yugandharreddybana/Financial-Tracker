import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
interface Props { data:{month:string;income:number;expense:number}[]; }
const MonthlyTrendChart: React.FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={data} margin={{top:5,right:10,left:0,bottom:0}}>
      <defs>
        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
      <XAxis dataKey="month" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
      <YAxis tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>`€${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
      <Tooltip formatter={(v:any)=>[`€${Number(v).toFixed(2)}`]} contentStyle={{borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"12px"}} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:"12px"}} />
      <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#colorInc)" name="Income" />
      <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fill="url(#colorExp)" name="Expenses" />
    </AreaChart>
  </ResponsiveContainer>
);
export default MonthlyTrendChart;
