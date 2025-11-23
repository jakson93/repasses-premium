              >
                <Save className="w-5 h-5" />
                <span>{editingId ? "Atualizar" : "Cadastrar"}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors duration-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Motorcycles List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="speed-loading rounded-full h-12 w-12"></div>
        </div>
      ) : filteredMotorcycles.length > 0 ? (
        <div className="space-y-4">
          {filteredMotorcycles.map((motorcycle) => (
            <div key={motorcycle.id} className="premium-card p-6 rounded-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-white">
                      {motorcycle.brand} {motorcycle.model}
                    </h3>
                    {motorcycle.is_featured === 1 && (
                      <span className="px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold">
                        DESTAQUE
                      </span>
                    )}
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor((motorcycle as any).status || 'disponivel')}`}>
                      {getStatusIcon((motorcycle as any).status || 'disponivel')}
                      <span>{((motorcycle as any).status || 'disponivel').replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                    <span>Ano: {motorcycle.year || "N/A"}</span>
                    <span className="text-yellow-400 font-semibold">
                      {formatPrice(motorcycle.price)}
                    </span>
                    {motorcycle.mileage && (
                      <span>{motorcycle.mileage.toLocaleString("pt-BR")} km</span>
                    )}
                    <span>Condição: {motorcycle.condition || "N/A"}</span>
                  </div>

                  {motorcycle.is_financed === 1 && (
                    <div className="flex items-center space-x-4 text-sm mb-2">
                      <span className="text-purple-400">🏦 Financiada</span>
                      {motorcycle.is_overdue === 1 && (
                        <span className="text-red-400 flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Em atraso</span>
                        </span>
                      )}
                      {motorcycle.finance_days_remaining && (
                        <span className="text-gray-400">
                          {motorcycle.finance_days_remaining} dias restantes
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Change */}
                  <select
                    value={(motorcycle as any).status || 'disponivel'}
                    onChange={(e) => handleStatusChange(motorcycle.id, e.target.value)}
                    className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservada">Reservada</option>
                    <option value="vendida">Vendida</option>
                    <option value="aguardando_pagamento">Aguardando Pagamento</option>
                  </select>

                  <button
                    onClick={() => toggleFeatured(motorcycle)}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      motorcycle.is_featured === 1
                        ? "bg-yellow-500 text-black speed-glow"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    title={motorcycle.is_featured === 1 ? "Remover destaque" : "Destacar"}
                  >
                    <Star className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setManagingImagesId(motorcycle.id)}
                    className="p-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors duration-200"
                    title="Gerenciar imagens"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleEdit(motorcycle)}
                    className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(motorcycle.id)}
                    className="p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Car className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {searchTerm || statusFilter !== "all" 
              ? "Nenhuma moto encontrada com os filtros aplicados" 
              : "Nenhuma moto cadastrada ainda"
            }
          </p>
        </div>
      )}

      {/* Image Manager Modal */}
      {managingImagesId !== null && (
        <ImageManager
          motorcycleId={managingImagesId}
          currentThumbnail={motorcycles.find(m => m.id === managingImagesId)?.thumbnail_url}
          onClose={() => setManagingImagesId(null)}
          onUpdate={loadMotorcycles}
        />
      )}
    </div>
  );
}
