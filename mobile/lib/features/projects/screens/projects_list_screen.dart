import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:proje_haritasi_mobile/features/auth/providers/auth_provider.dart';
import 'package:proje_haritasi_mobile/features/projects/providers/projects_provider.dart';
import 'package:proje_haritasi_mobile/features/projects/models/project_model.dart';

const _turkishProvinces = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin',
  'Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale',
  'Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum',
  'Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Isparta','Mersin',
  'İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli',
  'Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş',
  'Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas',
  'Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat',
  'Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın',
  'Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce',
];

const _statusOptions = [
  {'value': '', 'label': 'Tüm Durumlar'},
  {'value': 'planning', 'label': 'Planlama'},
  {'value': 'active', 'label': 'Aktif'},
  {'value': 'completed', 'label': 'Tamamlandı'},
  {'value': 'cancelled', 'label': 'İptal'},
];

class ProjectsListScreen extends StatefulWidget {
  const ProjectsListScreen({super.key});

  @override
  State<ProjectsListScreen> createState() => _ProjectsListScreenState();
}

class _ProjectsListScreenState extends State<ProjectsListScreen> {
  final _searchController = TextEditingController();
  String _selectedProvince = '';
  String _selectedStatus = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProjectsProvider>().load(resetPage: true);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'active': return Colors.green;
      case 'planning': return Colors.blue;
      case 'completed': return Colors.purple;
      case 'cancelled': return Colors.grey;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<ProjectsProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Projeler')),
      floatingActionButton: auth.user?.isEditor == true
          ? FloatingActionButton(
              onPressed: () => context.push('/projects/new'),
              child: const Icon(Icons.add),
            )
          : null,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Proje ara...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              context.read<ProjectsProvider>().setFilter(search: '');
                            },
                          )
                        : null,
                    isDense: true,
                  ),
                  onChanged: (v) =>
                      context.read<ProjectsProvider>().setFilter(search: v),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedProvince,
                        decoration: const InputDecoration(
                          isDense: true,
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                        ),
                        items: [
                          const DropdownMenuItem(
                              value: '', child: Text('Tüm İller')),
                          ..._turkishProvinces.map((p) => DropdownMenuItem(
                              value: p, child: Text(p))),
                        ],
                        onChanged: (v) {
                          setState(() => _selectedProvince = v ?? '');
                          context
                              .read<ProjectsProvider>()
                              .setFilter(province: v ?? '');
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedStatus,
                        decoration: const InputDecoration(
                          isDense: true,
                          contentPadding:
                              EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                        ),
                        items: _statusOptions
                            .map((s) => DropdownMenuItem(
                                value: s['value'],
                                child: Text(s['label']!)))
                            .toList(),
                        onChanged: (v) {
                          setState(() => _selectedStatus = v ?? '');
                          context
                              .read<ProjectsProvider>()
                              .setFilter(status: v ?? '');
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (provider.loading)
            const LinearProgressIndicator(),
          if (provider.error != null)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(provider.error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              itemCount: provider.projects.length,
              itemBuilder: (_, i) {
                final p = provider.projects[i];
                return _ProjectCard(
                  project: p,
                  statusColor: _statusColor(p.status),
                  onTap: () => context.push('/projects/${p.id}'),
                );
              },
            ),
          ),
          if (provider.total > 0)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    onPressed: provider.page > 1
                        ? () => context.read<ProjectsProvider>().prevPage()
                        : null,
                    icon: const Icon(Icons.chevron_left),
                  ),
                  Text('Sayfa ${provider.page}  •  ${provider.total} proje'),
                  IconButton(
                    onPressed: provider.hasMore
                        ? () => context.read<ProjectsProvider>().nextPage()
                        : null,
                    icon: const Icon(Icons.chevron_right),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  final ProjectModel project;
  final Color statusColor;
  final VoidCallback onTap;

  const _ProjectCard({
    required this.project,
    required this.statusColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(project.name,
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                  ),
                  if (project.isDelayed)
                    const Padding(
                      padding: EdgeInsets.only(left: 4),
                      child: Icon(Icons.warning_amber,
                          color: Colors.orange, size: 18),
                    ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(project.statusDisplay,
                        style: TextStyle(
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.location_on_outlined,
                      size: 14,
                      color: Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withValues(alpha: 0.5)),
                  const SizedBox(width: 2),
                  Text(project.province,
                      style: Theme.of(context).textTheme.bodySmall),
                  if (project.ownerUsername != null) ...[
                    const SizedBox(width: 12),
                    Icon(Icons.person_outline,
                        size: 14,
                        color: Theme.of(context)
                            .colorScheme
                            .onSurface
                            .withValues(alpha: 0.5)),
                    const SizedBox(width: 2),
                    Text(project.ownerUsername!,
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: project.progress / 100,
                      backgroundColor: Colors.grey.shade200,
                      color: project.progress >= 80
                          ? Colors.green
                          : project.progress >= 40
                              ? Colors.blue
                              : Colors.orange,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text('${project.progress}%',
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
