import { useState, useEffect } from 'react';
import { suppliers as initialSuppliers } from './data/suppliers';
import type { Supplier } from './data/suppliers';
import { 
  Building2, 
  ExternalLink, 
  MessageCircle, 
  X, 
  Phone, 
  CreditCard, 
  Wallet,
  AlertCircle,
  Mail,
  Truck,
  ShoppingCart,
  UserCircle,
  Edit2,
  Save,
  Ban,
  Plus,
  Image as ImageIcon,
  GripHorizontal
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './App.css';

// Componente individual ordenable
function SortableSupplierCard({ supplier, onClick }: { supplier: Supplier, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: supplier.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="supplier-card"
    >
      <div 
        className="drag-handle" 
        {...attributes} 
        {...listeners}
        title="Arrastra para reordenar"
      >
        <GripHorizontal size={20} />
      </div>
      
      <div className="card-content" onClick={onClick}>
        <div className="card-header">
          <div className="logo-container">
            {supplier.logoUrl ? (
              <img key={supplier.logoUrl} src={supplier.logoUrl} alt={supplier.name} onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>';
              }}/>
            ) : (
              <Building2 size={32} color="#8b949e" />
            )}
          </div>
          <h2 className="supplier-name">{supplier.name}</h2>
        </div>
        
        <div className="tags-container">
          {supplier.tags?.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <div className="card-footer">
          <span>{supplier.repName || 'Sin asesor'}</span>
          <span>{supplier.creditDays || 0} días crédito</span>
        </div>
      </div>
    </div>
  );
}


function App() {
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editFormData, setEditFormData] = useState<Supplier | null>(null);

  // Configuración de sensores para DnD (ignorar clics rápidos)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const saved = localStorage.getItem('herramax_suppliers');
    if (saved) {
      try {
        setLocalSuppliers(JSON.parse(saved));
      } catch(e) {
        setLocalSuppliers(initialSuppliers);
      }
    } else {
      setLocalSuppliers(initialSuppliers);
    }
  }, []);

  const selectedSupplier = isCreating 
    ? editFormData 
    : localSuppliers.find(s => s.id === selectedSupplierId);

  const openWhatsApp = (phone: string) => {
    if (phone) window.open(`https://wa.me/${phone.replace(/\D/g,'')}`, '_blank');
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedSupplier && !isCreating) {
      setEditFormData({ ...selectedSupplier });
      setIsEditing(true);
    }
  };

  const handleCreateNew = () => {
    const newSupplier: Supplier = {
      id: `prov_${Date.now()}`,
      name: 'Nuevo Proveedor',
      logoUrl: '',
      repName: '',
      phone: '',
      email: '',
      b2bUrl: '',
      b2bUser: '',
      creditDays: 0,
      minimumOrder: '',
      deliveryDays: '',
      bankAccount: '',
      notes: '',
      tags: []
    };
    setEditFormData(newSupplier);
    setIsCreating(true);
    setIsEditing(true);
    setSelectedSupplierId(null);
  };

  const handleCancelEdit = () => {
    setEditFormData(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!editFormData) return;
    
    let updatedSuppliers;
    if (isCreating) {
      updatedSuppliers = [...localSuppliers, editFormData];
      setSelectedSupplierId(editFormData.id);
    } else {
      updatedSuppliers = localSuppliers.map(s => 
        s.id === editFormData.id ? editFormData : s
      );
    }
    
    setLocalSuppliers(updatedSuppliers);
    localStorage.setItem('herramax_suppliers', JSON.stringify(updatedSuppliers));
    
    setIsEditing(false);
    setIsCreating(false);
    setEditFormData(null);
  };

  const handleInputChange = (field: keyof Supplier, value: string | number) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [field]: value });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalSuppliers((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newArray = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('herramax_suppliers', JSON.stringify(newArray));
        return newArray;
      });
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Directorio de Proveedores</h1>
        <p>Herramax Plus B2B</p>
      </header>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <main className="suppliers-grid">
          <SortableContext 
            items={localSuppliers.map(s => s.id)}
            strategy={rectSortingStrategy}
          >
            {localSuppliers.map(supplier => (
              <SortableSupplierCard 
                key={supplier.id}
                supplier={supplier}
                onClick={() => {
                  setSelectedSupplierId(supplier.id);
                  setIsEditing(false);
                  setIsCreating(false);
                }}
              />
            ))}
          </SortableContext>
        </main>
      </DndContext>

      <div className="fab-container">
        <button className="fab" onClick={handleCreateNew} title="Agregar Nuevo Proveedor">
          <Plus size={32} />
        </button>
      </div>

      {selectedSupplier && (
        <div className="modal-overlay" onClick={() => !isEditing && setSelectedSupplierId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            
            {!isEditing && !isCreating && (
              <div className="modal-header-actions" style={{ zIndex: 10 }}>
                <button type="button" className="icon-btn" onClick={handleEditClick} title="Editar Proveedor">
                  <Edit2 size={18} />
                </button>
                <button type="button" className="icon-btn" onClick={() => setSelectedSupplierId(null)} title="Cerrar">
                  <X size={20} />
                </button>
              </div>
            )}

            <div className="modal-header">
              <div 
                className="logo-container" 
                style={isEditing ? { cursor: 'pointer' } : {}}
                onClick={() => {
                  if (isEditing) {
                    document.getElementById('logo-upload')?.click();
                  }
                }}
              >
                {isEditing && (
                  <div className="logo-edit-overlay">
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Cambiar</span>
                  </div>
                )}
                <input 
                  type="file" 
                  id="logo-upload" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload}
                />
                
                {(isEditing ? editFormData?.logoUrl : selectedSupplier.logoUrl) ? (
                  <img key={(isEditing ? editFormData?.logoUrl : selectedSupplier.logoUrl)} src={(isEditing ? editFormData?.logoUrl : selectedSupplier.logoUrl)} alt={selectedSupplier.name} onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}/>
                ) : (
                  <Building2 size={40} color="#8b949e" />
                )}
              </div>
              <div>
                {isEditing ? (
                  <input 
                    className="form-input" 
                    style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.3)' }}
                    value={editFormData?.name || ''} 
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Nombre del Proveedor"
                  />
                ) : (
                  <h2>{selectedSupplier.name}</h2>
                )}

                {!isEditing && !isCreating && (
                  <div className="tags-container" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
                    {selectedSupplier.tags?.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-body">
              <div className="info-group">
                {/* Logo URL */}
                {isEditing && (
                  <div className="info-row">
                    <div className="info-icon"><ImageIcon size={20} /></div>
                    <div className="info-text">
                      <div className="info-label">URL del Logo (Imagen)</div>
                      <input 
                        className="form-input" 
                        value={editFormData?.logoUrl || ''} 
                        onChange={e => handleInputChange('logoUrl', e.target.value)}
                        placeholder="https://ejemplo.com/logo.png"
                      />
                    </div>
                  </div>
                )}

                {/* Rep Name & Phone */}
                <div className="info-row">
                  <div className="info-icon"><Phone size={20} /></div>
                  <div className="info-text">
                    <div className="info-label">Asesor Comercial</div>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          className="form-input" 
                          value={editFormData?.repName || ''} 
                          onChange={e => handleInputChange('repName', e.target.value)}
                          placeholder="Nombre del asesor"
                        />
                        <input 
                          className="form-input" 
                          value={editFormData?.phone || ''} 
                          onChange={e => handleInputChange('phone', e.target.value)}
                          placeholder="Teléfono (ej. 5255...)"
                        />
                      </div>
                    ) : (
                      <div className="info-value">{selectedSupplier.repName} ({selectedSupplier.phone})</div>
                    )}
                  </div>
                </div>

                {/* Email */}
                {(selectedSupplier.email || isEditing) && (
                  <div className="info-row">
                    <div className="info-icon"><Mail size={20} /></div>
                    <div className="info-text">
                      <div className="info-label">Correo Electrónico</div>
                      {isEditing ? (
                        <input 
                          className="form-input" 
                          value={editFormData?.email || ''} 
                          onChange={e => handleInputChange('email', e.target.value)}
                          placeholder="correo@ejemplo.com"
                        />
                      ) : (
                        <div className="info-value">
                          <a href={`mailto:${selectedSupplier.email}`} style={{color: '#fff', textDecoration: 'underline'}}>
                            {selectedSupplier.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Minimum Order */}
                <div className="info-row">
                  <div className="info-icon"><ShoppingCart size={20} /></div>
                  <div className="info-text">
                    <div className="info-label">Monto Mínimo OC</div>
                    {isEditing ? (
                      <input 
                        className="form-input" 
                        value={editFormData?.minimumOrder || ''} 
                        onChange={e => handleInputChange('minimumOrder', e.target.value)}
                        placeholder="Ej. $10,000 MXN"
                      />
                    ) : (
                      <div className="info-value">{selectedSupplier.minimumOrder}</div>
                    )}
                  </div>
                </div>

                {/* Delivery Days */}
                <div className="info-row">
                  <div className="info-icon"><Truck size={20} /></div>
                  <div className="info-text">
                    <div className="info-label">Día de Entrega</div>
                    {isEditing ? (
                      <input 
                        className="form-input" 
                        value={editFormData?.deliveryDays || ''} 
                        onChange={e => handleInputChange('deliveryDays', e.target.value)}
                        placeholder="Ej. Lunes y Jueves"
                      />
                    ) : (
                      <div className="info-value">{selectedSupplier.deliveryDays}</div>
                    )}
                  </div>
                </div>

                {/* B2B User */}
                {(selectedSupplier.b2bUser || isEditing) && (
                  <div className="info-row">
                    <div className="info-icon"><UserCircle size={20} /></div>
                    <div className="info-text">
                      <div className="info-label">Usuario Portal B2B</div>
                      {isEditing ? (
                        <input 
                          className="form-input" 
                          value={editFormData?.b2bUser || ''} 
                          onChange={e => handleInputChange('b2bUser', e.target.value)}
                          placeholder="Usuario B2B"
                        />
                      ) : (
                        <div className="info-value">{selectedSupplier.b2bUser}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* B2B URL */}
                {(selectedSupplier.b2bUrl || isEditing) && (
                  <div className="info-row">
                    <div className="info-icon"><ExternalLink size={20} /></div>
                    <div className="info-text">
                      <div className="info-label">URL del Portal B2B</div>
                      {isEditing ? (
                        <input 
                          className="form-input" 
                          value={editFormData?.b2bUrl || ''} 
                          onChange={e => handleInputChange('b2bUrl', e.target.value)}
                          placeholder="https://..."
                        />
                      ) : (
                        <div className="info-value" style={{wordBreak: 'break-all'}}>{selectedSupplier.b2bUrl}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Credit Days */}
                <div className="info-row">
                  <div className="info-icon"><CreditCard size={20} /></div>
                  <div className="info-text">
                    <div className="info-label">Días de Crédito</div>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="number"
                          className="form-input" 
                          style={{ width: '100px' }}
                          value={editFormData?.creditDays || 0} 
                          onChange={e => handleInputChange('creditDays', Number(e.target.value))}
                        />
                        <span style={{ color: '#fff' }}>días</span>
                      </div>
                    ) : (
                      <div className="info-value">{selectedSupplier.creditDays} días</div>
                    )}
                  </div>
                </div>

                {/* Bank Account */}
                <div className="info-row">
                  <div className="info-icon"><Wallet size={20} /></div>
                  <div className="info-text">
                    <div className="info-label">Cuenta Bancaria</div>
                    {isEditing ? (
                      <input 
                        className="form-input" 
                        value={editFormData?.bankAccount || ''} 
                        onChange={e => handleInputChange('bankAccount', e.target.value)}
                        placeholder="Banco: Cuenta"
                      />
                    ) : (
                      <div className="info-value">{selectedSupplier.bankAccount}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {(selectedSupplier.notes || isEditing) && (
                <div className="notes-section">
                  <h3><AlertCircle size={16} /> Notas Operativas</h3>
                  {isEditing ? (
                    <textarea 
                      className="form-textarea"
                      value={editFormData?.notes || ''}
                      onChange={e => handleInputChange('notes', e.target.value)}
                      placeholder="Escribe notas operativas aquí..."
                    />
                  ) : (
                    <p className="notes-content">{selectedSupplier.notes}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {isEditing ? (
              <div className="action-buttons">
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  <Ban size={20} /> Cancelar
                </button>
                <button type="button" className="btn btn-success" onClick={handleSave}>
                  <Save size={20} /> Guardar Proveedor
                </button>
              </div>
            ) : (
              <div className="action-buttons">
                <a 
                  href={selectedSupplier.b2bUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <ExternalLink size={20} /> Portal B2B
                </a>
                <button 
                  type="button"
                  className="btn btn-whatsapp"
                  onClick={() => openWhatsApp(selectedSupplier.phone)}
                >
                  <MessageCircle size={20} /> WhatsApp
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
