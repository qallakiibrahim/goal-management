/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Mail, 
  Shield, 
  Search, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  X,
  AlertCircle
} from 'lucide-react';
import { Member } from '../types';

interface MembersViewProps {
  members: Member[];
  onInviteMember: (email: string, name: string, role: string) => void;
  onRemoveMember: (id: string, name?: string) => void;
  currentUserIdEmail?: string | null;
  currentUserRole?: string;
}

export default function MembersView({
  members,
  onInviteMember,
  onRemoveMember,
  currentUserIdEmail,
  currentUserRole = 'Administratör'
}: MembersViewProps) {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('Skrivskyddad');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = currentUserRole === 'Administratör';

  const handleInviteSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Vänligen fyll i en giltig e-postadress.');
      return;
    }

    const emailLower = emailInput.trim().toLowerCase();
    
    // Check if duplicate invitation
    const duplicate = members.find(m => m.email.toLowerCase() === emailLower);
    if (duplicate) {
      setErrorMsg(`Användaren med e-post ${emailLower} är redan inbjuden eller tillagd.`);
      return;
    }

    onInviteMember(emailLower, nameInput.trim() || emailLower.split('@')[0], roleInput);
    
    setEmailInput('');
    setNameInput('');
    setRoleInput('Skrivskyddad');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const filteredMembers = members.filter(m => 
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <UserPlus className="w-5.5 h-5.5 text-indigo-900" /> Medlemmar & Google-Inbjudningar
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Bjud in dina kollegor med deras personliga Google- eller Workspace-konto. Endast inbjudna e-postadresser har tillgång till plattformen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Invite Form */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-display font-semibold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Mail className="w-4 h-4 text-indigo-900" /> Skicka Inbjudan
          </h3>

          {!isAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Ditt nuvarande konto har inte administratörsbehörlighet för att bjuda in användare.</span>
            </div>
          )}

          <form onSubmit={handleInviteSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Mottagarens Google E-post:</label>
              <input
                type="email"
                required
                disabled={!isAdmin}
                placeholder="exempel@moms-workspace.se"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-600 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Namn (valfritt):</label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="Kalle Nilsson"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden focus:border-indigo-600 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Roll / Rättigheter i systemet:</label>
              <select
                disabled={!isAdmin}
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-hidden disabled:opacity-50"
              >
                <option value="Administratör">Administratör (Skriva & Läsa)</option>
                <option value="Operativ ledare">Operativ ledare</option>
                <option value="Coachee">Kata Coachee (Experiment)</option>
                <option value="Skrivskyddad">Skrivskyddad (Observatör)</option>
              </select>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100 flex gap-1.5 items-center">
                <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex gap-1.5 items-center">
                <CheckCircle2 className="w-3.5 h-3.5" /> Inbjudan sparad och synkad!
              </p>
            )}

            <button
              type="submit"
              disabled={!isAdmin}
              className="w-full py-2.5 px-4 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Lägg till i behörighetslista
            </button>
          </form>
        </div>

        {/* Right column: Member List Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          
          {/* Top filtering banner */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-between bg-slate-50/50">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Sök på e-post, namn eller roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-hidden text-slate-700"
              />
            </div>
            
            <p className="text-[11px] text-slate-400 font-semibold font-mono">
              Totalt register: {filteredMembers.length} användare
            </p>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            {filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Inga inbjudna medlemmar hittades.</p>
                <p className="text-[10px] text-slate-400 mt-1">Lägg till din första kollega till vänster för att starta samarbete.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Användare</th>
                    <th className="px-5 py-3">Rättighetstyp</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Invited By / Datum</th>
                    {isAdmin && <th className="px-5 py-3 text-right">Åtgärd</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => {
                    const isSelf = currentUserIdEmail?.toLowerCase() === member.email.toLowerCase();
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            isSelf ? 'bg-indigo-900 ring-2 ring-indigo-200' : 'bg-slate-400'
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {member.name} {isSelf && <span className="bg-indigo-50 text-indigo-900 border border-indigo-100 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">Du</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">{member.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Shield className={`w-3.5 h-3.5 ${
                              member.role === 'Administratör' ? 'text-indigo-600' :
                              member.role === 'Operativ ledare' ? 'text-violet-600' : 'text-slate-400'
                            }`} />
                            {member.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {member.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <UserCheck className="w-3 h-3" /> Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 animate-pulse" /> Inbjuden
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-slate-500 leading-relaxed font-mono">
                          <p>{member.invitedBy || 'Initial'}</p>
                          <p className="text-[10px] text-slate-350">{member.invitedAt.split('T')[0]}</p>
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3.5 text-right">
                            <button
                              disabled={isSelf}
                              onClick={() => onRemoveMember(member.id, member.name)}
                              className="p-1 text-slate-400 hover:text-red-655 rounded-lg hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
                              title="Ta bort inbjudan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
